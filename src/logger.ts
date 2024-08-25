function print(props: {level: string}, ...args: any[]) {
    const date = new Date();

    console.log(`${date.toISOString()} [${props.level}]`, ...args);
}

function debug(...args: any[]) {
    if (process.env.DEBUG) {
        print({ level: 'DEBUG' }, ...args);
    }
}

function info(...args: any[]) {
    print({ level: 'INFO' }, ...args);
}

export const logger = {
    debug,
    info,
};