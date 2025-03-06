"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCache = getCache;
exports.getAnswer = getAnswer;
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("../logger");
const other_1 = require("./other");
const search_1 = require("./search");
const verse_1 = require("./verse");
const { meta } = (0, qute_corpus_1.loadQuran)();
const records = new Map(); // user => [verseId]
const MAX_RESULT = 7;
const intentIndex = ['chapter', 'verse', 'verses', 'tafsir', 'other'];
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
    // console.log('resp', resp);
    let answer = {};
    const keywordsEntity = entities.filter((e) => e.entity === 'keywords' && e.accuracy >= 0.1);
    // greeting
    if (intent.startsWith('greeting')) {
        records.delete(user);
        answer = (0, other_1.getGreeting)(resp);
        return answer;
    }
    // usage
    else if (intent === 'usage') {
        answer = (0, other_1.getUsage)(resp);
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
    if (((_c = (_b = answer.data) === null || _b === void 0 ? void 0 : _b.verses) === null || _c === void 0 ? void 0 : _c.length) > MAX_RESULT) {
        answer.data.next = true;
        const { data } = answer;
        // MAX_RESULT terakhir
        const nexts = data.verses.splice(MAX_RESULT, data.verses.length - MAX_RESULT);
        data.translations.splice(MAX_RESULT, data.translations.length - MAX_RESULT);
        data.audios.splice(MAX_RESULT, data.audios.length - MAX_RESULT);
        data.tafsirs.splice(MAX_RESULT, data.tafsirs.length - MAX_RESULT);
        (0, logger_1.debug)(`[BOT] nexts ${nexts.length}`);
        // simpan ke record
        const verseIds = nexts.filter((v) => !!v).map((v) => v.id);
        const userRecord = records.get(user);
        const prevSource = userRecord ? userRecord.source : answer.source;
        // convert intent to action
        const prevAction = intentIndex.includes(intent)
            ? 'index'
            : intent === 'None'
                ? answer.action
                : intent;
        // TODO: ini override,
        records.set(user, {
            action: prevAction,
            source: prevSource,
            verses: verseIds,
        });
        answer.source = prevSource;
        answer.action = prevAction;
    }
    else if (answer.data) {
        // jawaban kurang dari MAX_RESULT, ga perlu next
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
    const last = records.get(user);
    if (!last || !last.verses.length) {
        return {
            source: 'cache',
            action: 'none',
            text: 'Data tidak ditemukan',
        };
    }
    return (0, verse_1.getVersesByIds)(last.verses);
}
function getEntityAnswer(entities, intent) {
    var _a;
    let action = 'index';
    const source = intent === 'tafsir' ? 'tafsir' : 'quran';
    if (intentIndex.includes(intent))
        action = 'index';
    else
        action = intent;
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
    // kalau intent ga kedetek, coba cari entity
    if (intent === 'None' && (verseEntity.length || verseRangeEntity.length)) {
        action = 'index';
    }
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
    return (0, verse_1.getVerseRange)(chapter, verseStart, verseEnd || verseStart, 
    // TODO: tafsir index & search
    action, source);
}
