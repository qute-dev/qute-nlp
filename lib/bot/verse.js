"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerseRange = getVerseRange;
exports.getVersesByIds = getVersesByIds;
exports.getRandomVerse = getRandomVerse;
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("../logger");
const { ar, id, meta } = (0, qute_corpus_1.loadQuran)();
function formatAudioLink(chapter, verse) {
    const chapterStr = chapter.toString().padStart(3, '0');
    const verseStr = verse.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_64kbps/${chapterStr}${verseStr}.mp3`;
}
function formatChapterAudioLink(chapter) {
    const chapterStr = chapter.toString().padStart(3, '0');
    return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${chapterStr}.mp3`;
}
function getVerseRange(chapterNo, verseStart, verseEnd, action = 'index') {
    (0, logger_1.debug)('[BOT] getVerses', { chapterNo, verseStart, verseEnd });
    const chapter = id.chapters[chapterNo - 1];
    const verses = ar.verses.filter((v) => v.chapter === chapterNo && v.verse >= verseStart && v.verse <= verseEnd);
    const translations = id.verses.filter((v) => v.chapter === chapterNo && v.verse >= verseStart && v.verse <= verseEnd);
    let audios;
    if (verseStart === 1 && verseEnd === meta.chapters[chapterNo - 1].verses) {
        audios = [formatChapterAudioLink(chapterNo)];
    }
    else {
        audios = verses.map((verse) => formatAudioLink(verse.chapter, verse.verse));
    }
    return {
        source: 'quran',
        action,
        data: {
            chapter,
            verses,
            translations,
            audios,
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
            audios: [],
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
    answer.data.audios = answer.data.verses.map((verse) => formatAudioLink(verse.chapter, verse.verse));
    return answer;
}
function getRandomVerse() {
    const randomIndex = Math.floor(Math.random() * ar.verses.length);
    const verse = ar.verses[randomIndex];
    const translation = id.verses[randomIndex];
    const audio = formatAudioLink(verse.chapter, verse.verse);
    return {
        source: 'quran',
        action: 'random',
        data: {
            chapter: id.chapters[verse.chapter - 1],
            verses: [verse],
            translations: [translation],
            audios: [audio],
            next: false,
        },
    };
}
