"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const assert_1 = __importDefault(require("assert"));
const logger_1 = require("./logger");
const nlp_1 = require("./bot/nlp");
const answer_1 = require("./bot/answer");
const search_1 = require("./bot/search");
async function testQuestion(text) {
    var _a;
    const resp = await (0, nlp_1.process)(text);
    const answer = await (0, answer_1.getAnswer)(resp, 'TEST');
    (0, logger_1.log)(`[TEST] ${text} -> ${answer.text || ((_a = answer.data) === null || _a === void 0 ? void 0 : _a.translations.length)}`);
    (0, logger_1.debug)(`[TEST] intent: ${resp.intent}`);
    (0, logger_1.debug)('[TEST] entities:', resp.entities);
    // debug('[TEST] answer details:', answer.data?.translations);
    return answer;
}
async function testGreeting() {
    let answer;
    // sapaan
    answer = await testQuestion('halo');
    (0, assert_1.default)(!!answer.text);
    // salam
    answer = await testQuestion('assalamualaikum');
    (0, assert_1.default)(!!answer.text);
}
async function testIndex() {
    let answer;
    // surat
    answer = await testQuestion('surat albaqara');
    (0, assert_1.default)(answer.data.chapter.id === 2);
    // surat simple
    answer = await testQuestion('baqara');
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.data.verses.length === 10 &&
        answer.data.translations.length === 10);
    // lanjut
    answer = await testQuestion('lanjut');
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.data.verses.length === 10 &&
        answer.data.translations.length === 10);
    // ayat lengkap
    answer = await testQuestion('surat alfatihah ayat 5');
    (0, assert_1.default)(answer.data.chapter.id === 1 && answer.data.verses.length === 1);
    // ayat angka
    answer = await testQuestion('surat 2 ayat 10');
    (0, assert_1.default)(answer.data.chapter.id === 2 && answer.data.verses.length === 1);
    // ayat simple
    answer = await testQuestion('alfatihah 5');
    (0, assert_1.default)(answer.data.chapter.id === 1 && answer.data.verses.length === 1);
    // ayat tersimpel
    answer = await testQuestion('2 185');
    (0, assert_1.default)(answer.data.chapter.id === 2 && answer.data.verses.length === 1);
    // ayat range
    answer = await testQuestion('maidah 1-7');
    (0, assert_1.default)(answer.data.chapter.id === 5 && answer.data.verses.length === 7);
    // ayat range simple
    answer = await testQuestion('11 2-4');
    (0, assert_1.default)(answer.data.chapter.id === 11 && answer.data.verses.length === 3);
}
async function testSearch() {
    let answer;
    // dg cari
    answer = await testQuestion('cari manusia');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 10);
    // dg cari nama surat
    answer = await testQuestion('cari maryam');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 10);
    // cari kata cari
    answer = await testQuestion('cari mencari');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length > 0);
    // jodoh
    answer = await testQuestion('jodoh');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 0);
    // dg cari jodoh
    answer = await testQuestion('cari jodoh');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 0);
    // tanpa kata cari
    answer = await testQuestion('surga neraka');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 10);
    // next hasil cari
    answer = await testQuestion('next');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 10);
    // cari yg ga ada
    answer = await testQuestion('pacul');
    (0, assert_1.default)(!answer.data.chapter && answer.data.verses.length === 0);
    // TODO: cari di surat tertentu
    // answer = await testQuestion('cari allah di al baqarah');
    // assert(answer.data.chapter && answer.data.verses.length > 1);
}
async function testCache() {
    let answer;
    let cache;
    // surat
    answer = await testQuestion('surat albaqara');
    (0, assert_1.default)(answer.data.chapter.id === 2 && answer.data.verses.length === 10);
    // cek cache
    cache = await (0, answer_1.getCache)();
    (0, assert_1.default)(cache['TEST'].length === answer.data.chapter.verses - 10);
    for (let i = 2; i <= 5; i++) {
        // lanjut
        answer = await testQuestion('lanjut');
        (0, assert_1.default)(answer.data.chapter.id === 2 && answer.data.verses.length === 10);
        // cek cache lagi
        cache = await (0, answer_1.getCache)();
        (0, assert_1.default)(cache['TEST'].length === answer.data.chapter.verses - 10 * i);
    }
}
async function runTest() {
    await (0, nlp_1.initNlp)();
    await (0, search_1.initSearch)();
    await testGreeting();
    await testIndex();
    await testSearch();
    await testCache();
    process.exit(0);
}
runTest();
