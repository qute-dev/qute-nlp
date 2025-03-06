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
    const answerText = answer.text
        ? `${answer.text.substring(0, 10)}...`
        : undefined;
    (0, logger_1.log)(`[TEST] ${text} -> ${answerText || ((_a = answer.data) === null || _a === void 0 ? void 0 : _a.translations.length)}`);
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
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.action === 'index' &&
        answer.source === 'quran');
    // surat simple
    answer = await testQuestion('baqara');
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.data.verses.length === 7 &&
        answer.data.translations.length === 7 &&
        answer.action === 'index' &&
        answer.source === 'quran');
    // lanjut
    answer = await testQuestion('lanjut');
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.data.verses.length === 7 &&
        answer.data.translations.length === 7 &&
        answer.action === 'next' &&
        answer.source === 'quran');
    // ayat lengkap
    answer = await testQuestion('surat alfatihah ayat 5');
    (0, assert_1.default)(answer.data.chapter.id === 1 &&
        answer.data.verses.length === 1 &&
        answer.action === 'index' &&
        answer.source === 'quran');
    // ayat angka
    answer = await testQuestion('surat 2 ayat 7');
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.data.verses.length === 1 &&
        answer.action === 'index' &&
        answer.source === 'quran');
    // ayat simple
    answer = await testQuestion('alfatihah 5');
    (0, assert_1.default)(answer.source === 'quran' &&
        answer.action === 'index' &&
        answer.data.chapter.id === 1 &&
        answer.data.verses.length === 1);
    // ayat tersimpel
    answer = await testQuestion('2 185');
    (0, assert_1.default)(answer.data.chapter.id === 2 &&
        answer.data.verses.length === 1 &&
        answer.action === 'index' &&
        answer.source === 'quran');
    // ayat range
    answer = await testQuestion('maidah 1-7');
    (0, assert_1.default)(answer.data.chapter.id === 5 &&
        answer.data.verses.length === 7 &&
        answer.action === 'index' &&
        answer.source === 'quran');
    // ayat range simple
    answer = await testQuestion('11 2-4');
    (0, assert_1.default)(answer.data.chapter.id === 11 &&
        answer.data.verses.length === 3 &&
        answer.action === 'index' &&
        answer.source === 'quran');
}
async function testSearch() {
    let answer;
    // dg cari
    answer = await testQuestion('cari manusia');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 7 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // dg cari nama surat
    answer = await testQuestion('cari maryam');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 7 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // cari kata cari
    answer = await testQuestion('cari mencari');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length > 0 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // jodoh
    answer = await testQuestion('jodoh');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 0 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // dg cari jodoh
    answer = await testQuestion('cari jodoh');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 0 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // tanpa kata cari
    answer = await testQuestion('surga neraka');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 7 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // next hasil cari
    answer = await testQuestion('next');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 7 &&
        answer.action === 'next' &&
        answer.source === 'quran');
    // cari yg ga ada
    answer = await testQuestion('pacul');
    (0, assert_1.default)(!answer.data.chapter &&
        answer.data.verses.length === 0 &&
        answer.action === 'search' &&
        answer.source === 'quran');
    // TODO: cari di surat tertentu
    // answer = await testQuestion('cari allah di al baqarah');
    // assert(answer.data.chapter && answer.data.verses.length > 1 && answer.action === 'search' && answer.source === 'quran');
}
async function testCache() {
    let answer;
    let cache;
    // surat
    answer = await testQuestion('surat albaqara');
    (0, assert_1.default)(answer.data.chapter.id === 2 && answer.data.verses.length === 7);
    // cek cache
    cache = await (0, answer_1.getCache)();
    (0, assert_1.default)(cache['TEST'].verses.length === answer.data.chapter.verses - 7);
    for (let i = 2; i <= 5; i++) {
        // lanjut
        answer = await testQuestion('lanjut');
        (0, assert_1.default)(answer.data.chapter.id === 2 && answer.data.verses.length === 7);
        // cek cache lagi
        cache = await (0, answer_1.getCache)();
        (0, assert_1.default)(cache['TEST'].verses.length === answer.data.chapter.verses - 7 * i);
    }
}
async function testRandom() {
    var _a, _b, _c, _d, _e;
    let answer;
    answer = await testQuestion('random');
    (0, assert_1.default)((!!answer.text || ((_a = answer.data) === null || _a === void 0 ? void 0 : _a.translations.length) == 1) &&
        answer.action === 'random' &&
        answer.source === 'quran');
    answer = await testQuestion('random ayat');
    (0, assert_1.default)((!!answer.text || ((_b = answer.data) === null || _b === void 0 ? void 0 : _b.translations.length) == 1) &&
        answer.action === 'random' &&
        answer.source === 'quran');
    answer = await testQuestion('ayat random');
    (0, assert_1.default)((!!answer.text || ((_c = answer.data) === null || _c === void 0 ? void 0 : _c.translations.length) == 1) &&
        answer.action === 'random' &&
        answer.source === 'quran');
    answer = await testQuestion('ayat acak');
    (0, assert_1.default)((!!answer.text || ((_d = answer.data) === null || _d === void 0 ? void 0 : _d.translations.length) == 1) &&
        answer.action === 'random' &&
        answer.source === 'quran');
    answer = await testQuestion('minta ayat acak');
    (0, assert_1.default)((!!answer.text || ((_e = answer.data) === null || _e === void 0 ? void 0 : _e.translations.length) == 1) &&
        answer.action === 'random' &&
        answer.source === 'quran');
}
async function testTafsir() {
    let answer;
    // tafsir for specific chapter by name
    answer = await testQuestion('tafsir surat albaqara');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.chapter.id === 2);
    // TODO: next tafsir result
    answer = await testQuestion('lanjut');
    (0, assert_1.default)(answer.action === 'next' &&
        answer.source === 'tafsir' &&
        answer.data.chapter.id === 2 &&
        answer.data.verses.length === 7);
    // tafsir for specific chapter by number
    answer = await testQuestion('tafsir surat 2');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.chapter.id === 2);
    // tafsir for specific verse in chapter by name
    answer = await testQuestion('tafsir surat albaqara ayat 1');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 1);
    // tafsir for specific verse in chapter by number
    answer = await testQuestion('tafsir surat 2 ayat 1');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 1);
    // tafsir for verse range in chapter by name
    answer = await testQuestion('tafsir surat albaqara ayat 1-5');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 5);
    // tafsir for verse range in chapter by number
    answer = await testQuestion('tafsir surat 2 ayat 1-5');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 5);
    // additional tests without 'surat' and 'ayat' keywords
    answer = await testQuestion('tafsir albaqara');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.chapter.id === 2);
    answer = await testQuestion('tafsir 2');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.chapter.id === 2);
    answer = await testQuestion('tafsir albaqara 1');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 1);
    answer = await testQuestion('tafsir 2 1');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 1);
    answer = await testQuestion('tafsir albaqara 1-5');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 5);
    answer = await testQuestion('tafsir 2 1-5');
    (0, assert_1.default)(answer.action === 'index' &&
        answer.source === 'tafsir' &&
        answer.data.verses.length === 5);
}
async function testAudio() {
    let answer;
    answer = await testQuestion('putar audio surat albaqara');
    (0, assert_1.default)(answer.action === 'audio' &&
        answer.source === 'quran' &&
        answer.data.audios.length === 7);
    answer = await testQuestion('audio surat 1 ayat 1-3');
    (0, assert_1.default)(answer.action === 'audio' &&
        answer.source === 'quran' &&
        answer.data.audios.length === 3);
    answer = await testQuestion('audio surat an naas');
    (0, assert_1.default)(answer.action === 'audio' &&
        answer.source === 'quran' &&
        answer.data.audios.length > 1);
    // TODO: audio per chapter only
}
async function testUsage() {
    let answer;
    answer = await testQuestion('cara pakai');
    (0, assert_1.default)(answer.action === 'usage' && !!answer.text);
    answer = await testQuestion('cara kerja');
    (0, assert_1.default)(answer.action === 'usage' && !!answer.text);
    answer = await testQuestion('bagaimana cara menggunakan');
    (0, assert_1.default)(answer.action === 'usage' && !!answer.text);
    answer = await testQuestion('bagaimana cara kerja bot ini');
    (0, assert_1.default)(answer.action === 'usage' && !!answer.text);
}
async function runTest() {
    await (0, nlp_1.initNlp)();
    await (0, search_1.initSearch)();
    await testGreeting();
    await testIndex();
    await testSearch();
    await testCache();
    await testRandom();
    await testTafsir();
    await testAudio();
    await testUsage();
    process.exit(0);
}
runTest();
