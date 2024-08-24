const {
    requestGet,
    requestPost,
} = require('./http');

function login(login, password) {
    debug('Start login to', login);
    return requestPost("/1.0/login", {
        email: login,
        password: password,
    }).then(body => body.data.sid);
}

function getData(sid, id, date) {
    debug('Get meter', id, 'for', date);
    return requestGet("/1.0/meter/get", {
        sid,
        id,
        start: `${date}T00:00:00`,
        finish: `${date}T23:59:59`,
        group: 'day',
        absolute: 1,
    }).then(body => body.data);
}

function getObjects(sid) {
    debug('Get objects');
    return requestGet("/1.0/user/objects", {
        sid,
    }).then(body => body.data.objects);
}

function getMeters(sid, id) {
    debug('Get meters', id);
    return requestGet("/1.0/object/meters", {
        sid,
        id,
    }).then(body => body.data.sensors);
}

const TYPES = {
    1: 'COLD_WATER',
    2: 'HOT_WATER',
    8: 'ELECTRICITY',
};

module.exports = {
    login,
    getData,
    getObjects,
    getMeters,
    TYPES,
};
