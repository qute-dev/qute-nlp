"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGreeting = getGreeting;
exports.getUsage = getUsage;
const logger_1 = require("../logger");
function getGreeting(resp) {
    (0, logger_1.debug)('[BOT] getGreeting', { intent: resp.intent });
    return {
        source: 'other',
        action: 'greeting',
        text: resp.answer || resp.answers[0],
    };
}
function getUsage(resp) {
    (0, logger_1.debug)('[BOT] getUsage', { intent: resp.intent });
    return {
        source: 'other',
        action: 'usage',
        text: resp.answer || resp.answers[0],
    };
}
