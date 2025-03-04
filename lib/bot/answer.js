"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.getAnswer = getAnswer;
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("../logger");
const greeting_1 = require("./greeting");
const search_1 = require("./search");
const verse_1 = require("./verse");
const { meta } = (0, qute_corpus_1.loadQuran)();
const records = new Map(); // user => [verseId]
function getCache() {
    const cache = {};
    records.forEach((verseIds, user) => {
        cache[user] = verseIds;
    });
    return cache;
}
async function getAnswer(resp, user) {
    var _a, _b, _c, _d, _e;
    const { intent, entities } = resp;
    let answer = {};
    const keywordsEntity = entities.filter((e) => e.entity === 'keywords' && e.accuracy >= 0.1);
    // greeting
    if (intent.startsWith('greeting')) {
        records.delete(user);
        answer = (0, greeting_1.getGreeting)(resp);
        return answer;
    }
    // lanjut sesuai record
    else if (intent === 'next') {
        answer = getNextAnswer(user);
    }
    // handle random ayat
    else if (intent === 'random') {
        records.delete(user);
        answer = (0, verse_1.getRandomVerse)();
    }
    // handle tafsir intent
    else if (intent === 'tafsir') {
        records.delete(user);
        answer = getEntityAnswer(entities, intent);
    }
    // ada entity keyword search
    else if (keywordsEntity.length) {
        records.delete(user);
        const query = (resp.utterance || ((_a = keywordsEntity[0]) === null || _a === void 0 ? void 0 : _a.sourceText) || '')
            .replace('cari', '')
            .trim();
        answer = await (0, search_1.searchQuran)(query);
    }
    // ga ada entity kedetek, berarti pencarian
    else if (!entities.length) {
        records.delete(user);
        answer = await (0, search_1.searchQuran)(resp.utterance);
    }
    // cari di entity2
    else {
        records.delete(user);
        answer = getEntityAnswer(entities, intent);
    }
    if (((_c = (_b = answer.data) === null || _b === void 0 ? void 0 : _b.verses) === null || _c === void 0 ? void 0 : _c.length) > 10) {
        answer.data.next = true;
        // 10 terakhir
        const nexts = answer.data.verses.splice(10, answer.data.verses.length - 10);
        answer.data.translations.splice(10, answer.data.translations.length - 10);
        answer.data.audios.splice(10, answer.data.audios.length - 10);
        answer.data.tafsirs.splice(10, answer.data.tafsirs.length - 10);
        (0, logger_1.debug)(`[BOT] nexts ${nexts.length}`);
        // simpan ke record
        const verseIds = nexts.filter((v) => !!v).map((v) => v.id);
        records.set(user, verseIds);
    }
    else if (answer.data) {
        // jawaban kurang dari 10, ga perlu next
        answer.data.next = false;
        records.delete(user);
    }
    // ga ada ayat
    if (!((_e = (_d = answer.data) === null || _d === void 0 ? void 0 : _d.verses) === null || _e === void 0 ? void 0 : _e.length)) {
        answer.text = 'Data tidak ditemukan';
    }
    return answer;
}
function getNextAnswer(user) {
    (0, logger_1.debug)('[BOT] getNextAnswer', user);
    const lasts = records.get(user);
    if (!lasts || !lasts.length) {
        return {
            source: 'cache',
            action: 'none',
            text: 'Data tidak ditemukan',
        };
    }
    return (0, verse_1.getVersesByIds)(lasts);
}
function getEntityAnswer(entities, intent) {
    var _a;
    const verseEntity = entities.filter((e) => e.entity === 'verse_no' && e.accuracy >= 0.1);
    const verseRangeEntity = entities.filter((e) => e.entity === 'verse_range' && e.accuracy >= 0.1);
    const chapterNoEntity = entities.filter((e) => (e.entity === 'chapter_no' || e.entity === 'chapter_start_no') &&
        e.accuracy >= 0.1);
    const chapterEntity = entities.filter((e) => e.entity === 'chapter' && e.accuracy >= 0.7);
    const ents = {
        verseEntity,
        verseRangeEntity,
        chapterNoEntity,
        chapterEntity,
    };
    (0, logger_1.debug)('[BOT] getAnswer:entities', ents);
    let chapter = 0;
    let verseStart = 0;
    let verseEnd = 0;
    // banyak ayat
    if (verseRangeEntity.length) {
        const ayats = verseRangeEntity[0].sourceText.split('-');
        verseStart = parseInt(ayats[0].trim());
        verseEnd = parseInt(ayats[1].trim());
    }
    else if (verseEntity.length) {
        // ini kalau cuma 1 ayat aja
        verseStart = parseInt(verseEntity[0].sourceText.trim());
    }
    // ambil info surat
    if (chapterEntity.length) {
        chapter = parseInt(chapterEntity[0].option);
    }
    else if (chapterNoEntity.length) {
        // ini cuma nomor surat aja
        chapter = parseInt(chapterNoEntity[0].sourceText.trim());
        // nomor jgn dianggap ayat, tp sbg no surat
        if (verseEntity.length &&
            verseEntity[0].start === chapterNoEntity[0].start) {
            verseStart = verseEnd = 0;
        }
    }
    // batasi max ayat kalau surat yg tampil
    if (!verseStart && !verseEnd) {
        verseStart = 1;
        verseEnd = (_a = meta.chapters[chapter - 1]) === null || _a === void 0 ? void 0 : _a.verses;
    }
    return (0, verse_1.getVerseRange)(chapter, verseStart, verseEnd || verseStart, intent);
}
