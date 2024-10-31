"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGreeting = getGreeting;
const logger_1 = require("../logger");
function getGreeting(resp) {
    (0, logger_1.debug)('[BOT] getGreeting', { intent: resp.intent });
    return {
        source: 'other',
        action: 'greeting',
        text: resp.answer || resp.answers[0],
    };
}
