function debug(...args) {
    if (process.env.DEBUG) {
        console.log(...args);
    }
}

module.exports = {
    debug,
};
