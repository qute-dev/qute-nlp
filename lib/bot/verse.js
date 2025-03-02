"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerseRange = getVerseRange;
exports.getVersesByIds = getVersesByIds;
exports.getRandomVerse = getRandomVerse;
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("../logger");
const { ar, id, meta } = (0, qute_corpus_1.loadQuran)();
function getVerseRange(chapterNo, verseStart, verseEnd) {
    (0, logger_1.debug)('[BOT] getVerses', { chapterNo, verseStart, verseEnd });
    const chapter = id.chapters[chapterNo - 1];
    const verses = ar.verses.filter((v) => v.chapter === chapterNo && v.verse >= verseStart && v.verse <= verseEnd);
    const translations = id.verses.filter((v) => v.chapter === chapterNo && v.verse >= verseStart && v.verse <= verseEnd);
    return {
        source: 'quran',
        action: 'index',
        data: {
            chapter,
            verses,
            translations,
            next: true,
        },
    };
}
function getVersesByIds(verseIds) {
    const answer = {
        source: 'quran',
        action: 'index',
        data: {
            verses: [],
            translations: [],
        },
    };
    for (const verseId of verseIds) {
        const verse = ar.verses.find((v) => v.id === verseId);
        const trans = id.verses.find((v) => v.id === verseId);
        answer.data.verses.push(verse);
        answer.data.translations.push(trans);
    }
    // list chapter
    const chapters = [...new Set(answer.data.verses.map((v) => v.chapter))];
    // kalau chapter hanya 1, tambahkan chapter
    if (chapters.length === 1) {
        answer.data.chapter = meta.chapters.find((c) => c.id === chapters[0]);
    }
    return answer;
}
function getRandomVerse() {
    const randomIndex = Math.floor(Math.random() * ar.verses.length);
    const verse = ar.verses[randomIndex];
    const translation = id.verses[randomIndex];
    return {
        source: 'quran',
        action: 'random',
        data: {
            chapter: id.chapters[verse.chapter - 1],
            verses: [verse],
            translations: [translation],
            next: false,
        },
    };
}
