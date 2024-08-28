import got from "got";
import { readFile, saveFile } from "./utils/fs";
import { logger } from "./utils/logger";

const requestForm = got.extend({
    baseUrl: "https://api.saures.ru/",
    form: true,
});
const requestJson = got.extend({
    baseUrl: "https://api.saures.ru/",
    json: true,
});

function buildCacheFileName(id: string): string {
    return `build/cache-${id}.json`;
}

function saveCache<T>(id: string, data: T): void {
    saveFile(buildCacheFileName(id), JSON.stringify(data));
}

function getCache<T>(id: string): T | null {
    try {
        const data = readFile(buildCacheFileName(id)).trim();

        return JSON.parse(data) as T;
    } catch (err) {
        return null;
    }
}

const TEN_MINUTES = 1000 * 60 * 10;

// Авторизация пользователя в системе https://api.saures.ru/doc/1.0/login
interface ILoginResponse {
    data: {
        sid: string;
    };
}

export async function login(params: {
    login: string;
    password: string;
}): Promise<string> {
    logger.debug("Start login to", params.login);

    const cachedSid = getCache<{ sid: string; lifetime: number }>("sid");

    if (cachedSid && cachedSid.lifetime > Date.now()) {
        logger.info("Using sid from cache");

        return cachedSid.sid;
    }

    const res = await requestForm.post("/1.0/login", {
        body: {
            email: params.login,
            password: params.password,
        },
    });

    const body = JSON.parse(res.body) as ILoginResponse;

    saveCache("sid", {
        sid: body.data.sid,
        lifetime: Date.now() + TEN_MINUTES,
    });

    logger.info("Got sid", body.data.sid);

    return body.data.sid;
}

// Показания по устройству https://api.saures.ru/doc/1.0/meter/get
interface IDataResponse {
    data: {
        points: {
            datetime: string;
            vals: number[];
        }[];
        name: string;
        sn: string;
        type: number;
    };
}

export async function getData(
    sid: string,
    id: number,
    { start, finish }: { start: string; finish: string },
) {
    logger.debug("Get meter", id, "from", start, "to", finish);

    const res = await requestJson.get("/1.0/meter/get", {
        query: {
            sid,
            id,
            start,
            finish,
            group: "day",
            absolute: 1,
        },
    });

    return (res.body as IDataResponse).data;
}

// Объекты пользователя https://api.saures.ru/doc/1.0/user/objects
interface IObjectsResponse {
    data: {
        objects: {
            id: string;
        }[];
    };
}

export async function getObjects(sid: string): Promise<{ id: string }[]> {
    logger.debug("Get objects");

    const res = await requestJson.get("/1.0/user/objects", {
        query: {
            sid,
        },
    });

    return (res.body as IObjectsResponse).data.objects;
}

// Показания по объекту https://api.saures.ru/doc/1.0/object/meters
interface IMetersResponse {
    data: {
        sensors: {
            meters: {
                meter_id: number;
                type: { number: number };
            }[];
        }[];
    };
}

export async function getMeters(sid: string, id: string) {
    logger.debug("Get meters", id);

    const res = await requestJson.get("/1.0/object/meters", {
        query: {
            sid,
            id,
        },
    });

    return (res.body as IMetersResponse).data.sensors;
}

// Типы счётчиков
export const TYPES: Record<number, string> = {
    1: "WATER_COLD",
    2: "WATER_HOT",
    8: "ELECTRICITY",
};
