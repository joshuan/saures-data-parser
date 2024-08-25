import { getEnv } from "./env";
import { login, getData, getObjects, getMeters, TYPES } from "./saures";

type TLine = [string, number, string, string];

const ELECTRICITY_METRICS = ["ELECTRICITY_DAY", "ELECTRICITY_NIGHT"];

export async function main(date: string) {
    const sid = await login({
        login: getEnv("SAURES_USER"),
        password: getEnv("SAURES_PASSWORD"),
    });

    const { id: objectId } = (await getObjects(sid))[0];
    const meters = (await getMeters(sid, objectId))[0].meters.filter((meter) =>
        Boolean(TYPES[meter.type.number]),
    );
    const datas = await Promise.all(
        meters.map((meter) => getData(sid, meter.meter_id, date)),
    );

    const result: Array<TLine> = [
        ["datetime", "value", "meter", "type"] as unknown as TLine,
    ];

    for (const data of datas) {
        for (const point of data.points) {
            for (let i = 0; i < point.vals.length; i++) {
                result.push([
                    point.datetime,
                    point.vals[i],
                    data.name +
                        " / " +
                        data.sn +
                        (point.vals.length === 1 ? "" : ` / ${i}`),
                    TYPES[data.type] === "ELECTRICITY"
                        ? ELECTRICITY_METRICS[i]
                        : TYPES[data.type],
                ]);
            }
        }
    }

    return result.map((line) => line.join(";")).join("\n");
}
