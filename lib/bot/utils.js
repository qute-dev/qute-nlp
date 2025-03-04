"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAudioLink = formatAudioLink;
exports.formatChapterAudioLink = formatChapterAudioLink;
const qute_corpus_1 = require("qute-corpus");
const { meta } = (0, qute_corpus_1.loadQuran)();
function formatAudioLink(chapter, verse) {
    const chapterStr = chapter.toString().padStart(3, '0');
    const verseStr = verse.toString().padStart(3, '0');
    return `https://everyayah.com/data/Alafasy_64kbps/${chapterStr}${verseStr}.mp3`;
}
function formatChapterAudioLink(chapter) {
    const chapterStr = chapter.toString().padStart(3, '0');
    return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${chapterStr}.mp3`;
}
