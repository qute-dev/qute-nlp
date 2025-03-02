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
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const logger_1 = require("./logger");
const nlp_1 = require("./bot/nlp");
const answer_1 = require("./bot/answer");
const search_1 = require("./bot/search");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
async function handleQuestion(input) {
    if (input.toLowerCase() === 'exit') {
        (0, logger_1.log)('Session ended.');
        rl.close();
        process.exit(0);
    }
    try {
        const resp = await (0, nlp_1.process)(input);
        const answer = await (0, answer_1.getAnswer)(resp, 'CONSOLE');
        console.log(answer.text || answer);
    }
    catch (err) {
        (0, logger_1.error)('Error processing answer:', err);
    }
    promptUser();
}
function promptUser() {
    rl.question('> ', handleQuestion);
}
async function start() {
    await (0, nlp_1.initNlp)();
    await (0, search_1.initSearch)();
    console.log('Welcome to Qute-NLP testing console!');
    console.log('Enter your query or "exit" to end session.');
    promptUser();
}
start();
