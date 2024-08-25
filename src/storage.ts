import { getEnv } from "./env";
import { S3 } from "aws-sdk";

function getS3(options: Partial<S3.Types.ClientConfiguration>): S3 {
    return new S3({
        httpOptions: {
            timeout: options.httpOptions?.timeout || 10000,
            ...options.httpOptions,
        },

        maxRetries: options.maxRetries || 3,
        params: {
            ...options.params,
        },

        region: options.region || "us-east-1",
        sslEnabled: options.sslEnabled || true,
    });
}

const s3 = getS3({
    endpoint: getEnv("S3_ENDPOINT"),
    accessKeyId: getEnv("S3_ACCESS_KEY"),
    secretAccessKey: getEnv("S3_SECRET_KEY"),
    region: getEnv("S3_REGION"),
});

export function upload(
    params: { bucket: string; path: string },
    data: string
): Promise<S3.Types.PutObjectOutput> {
    return new Promise((resolve, reject) => {
        s3.putObject(
            {
                Bucket: params.bucket,
                Key: params.path,
                Body: data,
                ContentType: "text/plain",
            },
            (err, data) => {
                if (err) {
                    return reject(err);
                }

                return resolve(data);
            }
        );
    });
}
