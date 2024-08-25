"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/env.ts
function getEnv(KEY) {
  const value = process.env[KEY];
  if (!value) {
    throw new Error("Can not read environment variable: " + KEY);
  }
  return value;
}

// src/http.ts
var import_https = __toESM(require("https"));
var import_querystring = __toESM(require("querystring"));

// src/logger.ts
function print(props, ...args) {
  const date = /* @__PURE__ */ new Date();
  console.log(`${date.toISOString()} [${props.level}]`, ...args);
}
function debug(...args) {
  if (process.env.DEBUG) {
    print({ level: "DEBUG" }, ...args);
  }
}
function info(...args) {
  print({ level: "INFO" }, ...args);
}
var logger = {
  debug,
  info
};

// src/http.ts
function request(customOptions, postData) {
  logger.debug("Request:", customOptions.path);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.saures.ru",
      port: 443,
      ...customOptions
    };
    const req = import_https.default.request(options, (res) => {
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
              return Promise.reject(new Error("Response not ok", { cause: body.errors }));
            }
            resolve(body);
          } catch (err) {
            reject(new Error(`Response is not a JSON: ${data}`));
          }
        } else {
          reject(new Error(`Request failed with status code ${res.statusCode}`));
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
function requestGet(path, query) {
  const qs = import_querystring.default.stringify(query);
  return request({
    path: path + "?" + qs,
    method: "GET"
  });
}
function requestPost(path, formData) {
  const postData = import_querystring.default.stringify(formData);
  return request({
    path,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData)
    }
  }, postData);
}

// src/saures.ts
async function login(params) {
  logger.debug("Start login to", login);
  if (process.env.SAURES_SID) {
    return process.env.SAURES_SID;
  }
  const body = await requestPost("/1.0/login", {
    email: params.login,
    password: params.password
  });
  logger.info("Got sid", body.data.sid);
  return body.data.sid;
}
function getData(sid, id, date) {
  logger.debug("Get meter", id, "for", date);
  return requestGet("/1.0/meter/get", {
    sid,
    id,
    start: `${date}T00:00:00`,
    finish: `${date}T23:59:59`,
    group: "day",
    absolute: 1
  }).then((body) => body.data);
}
function getObjects(sid) {
  logger.debug("Get objects");
  return requestGet("/1.0/user/objects", {
    sid
  }).then((body) => body.data.objects);
}
function getMeters(sid, id) {
  logger.debug("Get meters", id);
  return requestGet("/1.0/object/meters", {
    sid,
    id
  }).then((body) => body.data.sensors);
}
var TYPES = {
  1: "COLD_WATER",
  2: "HOT_WATER",
  8: "ELECTRICITY"
};

// src/index.ts
var ELECTRICITY_METRICS = [
  "DAY",
  "NIGHT"
];
async function main() {
  const sid = await login({ login: getEnv("SAURES_USER"), password: getEnv("SAURES_PASSWORD") });
  const { id: objectId } = (await getObjects(sid))[0];
  const meters = (await getMeters(sid, objectId))[0].meters.filter((meter) => Boolean(TYPES[meter.type.number]));
  const datas = await Promise.all(meters.map((meter) => getData(sid, meter.meter_id, getEnv("PARSE_DATE"))));
  const result = [
    ["datetime", "value", "meter", "type", "index"]
  ];
  for (const data of datas) {
    for (const point of data.points) {
      for (let i = 0; i < point.vals.length; i++) {
        result.push([
          point.datetime,
          point.vals[i],
          data.name + " / " + data.sn + (point.vals.length === 0 ? "" : ` / ${i}`),
          TYPES[data.type] === "ELECTRICITY" ? ELECTRICITY_METRICS[i] : TYPES[data.type]
        ]);
      }
    }
  }
  console.log(result.map((line) => line.join(";")).join("\n"));
}
(async () => {
  try {
    await main();
  } catch (error) {
    console.error("Error:", error.message);
  }
})();
