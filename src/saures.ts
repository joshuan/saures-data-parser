import { requestGet, requestPost } from "./http";
import { logger } from "./logger";

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
    logger.debug("Start login to", login);

    if (process.env.SAURES_SID) {
        return process.env.SAURES_SID;
    }

    const body = await requestPost<ILoginResponse>("/1.0/login", {
        email: params.login,
        password: params.password,
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

export function getData(sid: string, id: number, date: string) {
    logger.debug("Get meter", id, "for", date);

    return requestGet<IDataResponse>("/1.0/meter/get", {
        sid,
        id,
        start: `${date}T00:00:00`,
        finish: `${date}T23:59:59`,
        group: "day",
        absolute: 1,
    }).then((body) => body.data);
}

// Объекты пользователя https://api.saures.ru/doc/1.0/user/objects
interface IObjectsResponse {
    data: {
        objects: {
            id: string;
        }[];
    };
}

export function getObjects(sid: string): Promise<{ id: string }[]> {
    logger.debug("Get objects");

    return requestGet<IObjectsResponse>("/1.0/user/objects", {
        sid,
    }).then((body) => body.data.objects);
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

export function getMeters(sid: string, id: string) {
    logger.debug("Get meters", id);
    return requestGet<IMetersResponse>("/1.0/object/meters", {
        sid,
        id,
    }).then((body) => body.data.sensors);
}

// Типы счётчиков
export const TYPES: Record<number, string> = {
    1: "WATER_COLD",
    2: "WATER_HOT",
    8: "ELECTRICITY",
};
