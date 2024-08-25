import { main } from "./main";
import { serviceClients, Session } from "@yandex-cloud/nodejs-sdk";
import { upload } from "./storage";
import { getEnv } from "./env";

export const handler = async function (event, context) {
    const session = new Session({ iamToken: context.token.access_token });
    const client = session.client(serviceClients.BucketServiceClient);

    const S3_BUCKET = getEnv("S3_BUCKET");

    const data = await main();
    await upload(`${S3_BUCKET}/data.csv`, data);

    return {
        statusCode: 201,
    };
};
