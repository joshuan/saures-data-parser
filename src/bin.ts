import { getEnv } from "./env";
import { logger } from "./logger";
import { main } from "./main";
import { upload } from "./storage";

(async () => {
    logger.info("Start process data");

    const data = await main();

    logger.info("Got data", data.length + " symbols");

    await upload({ bucket: getEnv("S3_BUCKET"), path: "data.csv" }, data);

    logger.info("Data uploaded to S3");
})();
