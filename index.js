const {
    login,
    getData,
    getObjects,
    getMeters,
    TYPES,
} = require('./saures');

async function main() {
    const sid = await login(process.env.SAURES_USER, process.env.SAURES_PASSWORD);
    
    const { id: objectId } = (await getObjects(sid))[0];
    const meters = (await getMeters(sid, objectId))[0].meters.filter(meter => Boolean(TYPES[meter.type.number]));
    const datas = await Promise.all(meters.map(meter => getData(sid, meter.meter_id, process.env.PARSE_DATE)));
    
    const result = [];

    for (const data of datas) {
        for (const point of data.points) {
            for (let i = 0; i < point.vals.length; i++) {
                result.push([
                    point.datetime,
                    point.vals[i],
                    data.name + (point.vals.length === 0 ? '' : ` (${i})`),
                ]);
            }
        }
    }

    console.log(result.map(line => line.join(';')).join("\n"));
}

(async () => {
    try {
        await main();
    } catch (error) {
        console.error("Error:", error.message);
    }
})();