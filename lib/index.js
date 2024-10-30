"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const Koa = __importStar(require("koa"));
const bodyParser = __importStar(require("koa-bodyparser"));
const json = __importStar(require("koa-json"));
const cors_1 = __importDefault(require("@koa/cors"));
const logger_1 = require("./logger");
const router_1 = require("./router");
const nlp_1 = require("./nlp");
const env_1 = require("./env");
const { NODE_ENV, DEBUG, HOST, PORT } = env_1.env;
async function start() {
    (0, logger_1.info)('[APP] Starting NLP API server...', { NODE_ENV, DEBUG });
    await (0, nlp_1.initNlp)();
    const app = new Koa.default();
    app.use(json.default());
    app.use(bodyParser.default());
    app.use((0, cors_1.default)());
    app.use(router_1.router.routes());
    app.use(router_1.router.allowedMethods());
    app.listen(Number(PORT), HOST);
    (0, logger_1.info)(`[APP] Server listening http://${HOST}:${PORT}`);
}
start();
