"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initNlp = exports.initSearch = exports.getRandomVerse = exports.getCache = exports.getAnswer = void 0;
exports.query = query;
var answer_1 = require("./answer");
Object.defineProperty(exports, "getAnswer", { enumerable: true, get: function () { return answer_1.getAnswer; } });
Object.defineProperty(exports, "getCache", { enumerable: true, get: function () { return answer_1.getCache; } });
var verse_1 = require("./verse");
Object.defineProperty(exports, "getRandomVerse", { enumerable: true, get: function () { return verse_1.getRandomVerse; } });
var search_1 = require("./search");
Object.defineProperty(exports, "initSearch", { enumerable: true, get: function () { return search_1.initSearch; } });
var nlp_1 = require("./nlp");
Object.defineProperty(exports, "initNlp", { enumerable: true, get: function () { return nlp_1.initNlp; } });
const nlp_2 = require("./nlp");
const answer_2 = require("./answer");
async function query(text, user = 'UNKNOWN') {
    const response = await (0, nlp_2.process)(text);
    const answer = await (0, answer_2.getAnswer)(response, user);
    return answer;
}
