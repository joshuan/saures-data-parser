import https, { RequestOptions } from "https";
import querystring from "querystring";
import { logger } from "./logger";

function request<R>(
    customOptions: Omit<RequestOptions, "hostname" | "port">,
    postData?: string
): Promise<R> {
    logger.debug("Request:", customOptions.path);
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "api.saures.ru",
            port: 443,
            ...customOptions,
        };

        const req = https.request(options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                logger.debug("Response:", res.statusCode);
                if (res.statusCode === 200) {
                    try {
                        const body = JSON.parse(data);

                        if (body.status !== "ok") {
                            return Promise.reject(
                                new Error("Response not ok", {
                                    cause: body.errors,
                                })
                            );
                        }

                        resolve(body);
                    } catch (err) {
                        reject(new Error(`Response is not a JSON: ${data}`));
                    }
                } else {
                    reject(
                        new Error(
                            `Request failed with status code ${res.statusCode}`
                        )
                    );
                }
            });
        });

        req.on("error", (e) => {
            reject(new Error(`Problem with request: ${e.message}`));
        });

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
}

export function requestGet<R, T extends {} = {}>(path: string, query: T) {
    const qs = querystring.stringify(query);

    return request<R>({
        path: path + "?" + qs,
        method: "GET",
    });
}

export function requestPost<R, T extends {} = {}>(path: string, formData: T) {
    const postData = querystring.stringify(formData);

    return request<R>(
        {
            path: path,
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(postData),
            },
        },
        postData
    );
}
