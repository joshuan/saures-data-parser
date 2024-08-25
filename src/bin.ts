import { getEnv } from "./env";
import { logger } from "./logger";
import { main } from "./main";
import { upload } from "./storage";

(async () => {
    const date = getEnv("PROCESS_DATE");

    logger.info("Start process data for date", date);

    const data = await main(date);

    logger.info("Got data", data.length + " symbols");

    await upload(
        { bucket: getEnv("S3_BUCKET"), path: `meters/${date}.csv` },
        data,
    );

    logger.info("Data uploaded to S3");
})();
