import { main } from "./main";
import { upload } from "./storage";
import { getEnv } from "./env";
import { logger } from "./logger";

export const handler = async function () {
    const date = new Date(new Date().getTime() - 3600 * 24 * 1000)
        .toISOString()
        .split("T")[0];

    logger.info("Start process data for date", date);

    const data = await main(date);

    logger.info("Got data", data.length + " symbols");

    await upload(
        { bucket: getEnv("S3_BUCKET"), path: `meters/${date}.csv` },
        data
    );

    logger.info("Data uploaded to S3");

    return {
        statusCode: 201,
    };
};
