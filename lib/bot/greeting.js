"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGreeting = void 0;
const uuid_1 = require("uuid");
const logger_1 = require("../logger");
function getGreeting(resp) {
    (0, logger_1.debug)('[BOT] getGreeting', resp.intent);
    return {
        id: (0, uuid_1.v4)(),
        time: Date.now(),
        source: 'other',
        action: 'greeting',
        text: resp.answer || resp.answers[0],
    };
}
exports.getGreeting = getGreeting;
