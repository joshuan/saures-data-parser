import { getEnv } from "./env";
import { PutObjectCommandOutput, S3 } from "@aws-sdk/client-s3";

const client = new S3({
    credentials: {
        accessKeyId: getEnv("S3_ACCESS_KEY"),
        secretAccessKey: getEnv("S3_SECRET_KEY"),
    },
    endpoint: getEnv("S3_ENDPOINT"),
    region: getEnv("S3_REGION"),
});

export async function upload(
    params: { bucket: string; path: string },
    data: string
): Promise<PutObjectCommandOutput> {
    return await client.putObject({
        Bucket: params.bucket,
        Key: params.path,
        Body: data,
    });
}
