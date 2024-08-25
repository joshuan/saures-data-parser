export function getEnv(KEY: string): string {
    const value = process.env[KEY];

    if (!value) {
        throw new Error('Can not read environment variable: ' + KEY);
    }

    return value;
}