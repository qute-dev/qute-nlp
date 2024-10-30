"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.debug = exports.info = exports.log = exports.logger = void 0;
const pino_1 = require("pino");
exports.logger = (0, pino_1.pino)({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: `pid,hostname,name`,
            hideObject: process.env.DEBUG !== 'true',
        },
    },
    level: process.env.DEBUG === 'true' ? 'debug' : 'info',
});
const log = (text, obj, ...args) => exports.logger.info(obj, text, args);
exports.log = log;
exports.info = exports.log;
const debug = (text, obj, ...args) => exports.logger.debug(obj, text, args);
exports.debug = debug;
const error = (text, obj, ...args) => exports.logger.error(obj, text, args);
exports.error = error;
