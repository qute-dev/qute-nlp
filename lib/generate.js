"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs_extra_1 = __importDefault(require("fs-extra"));
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("./logger");
const nlp_1 = require("./nlp");
const bot_1 = require("./bot");
async function buildEntities(meta) {
    (0, logger_1.log)('Building entities...');
    const options = {};
    // entities surah: al ikhlas, fatihah
    for (const c of meta.chapters) {
        const name = c.name.toLowerCase();
        options[c.id] = [
            name.replace('-', ' '),
            name.replace(/[\s\-]/g, ''),
            name.replace(/.+[\s\-]/, '').replace(/\W/gi, ''), // hilangkan spasi di awal & karakter lains
        ];
    }
    const regexEntities = {
        verse_no: '/\\s+\\d+$/gi',
        verse_range: '/\\d+\\s*\\-\\s*\\d+$/gi',
        chapter_no: '/\\s+\\d+\\s*?/gi',
        chapter_start_no: '/^\\d+\\s.*?/gi',
        keywords: '/cari\\s.+/gi', // semua kata di cari
    };
    return Object.assign({ chapter: { options } }, regexEntities);
}
function buildIntents(corpus) {
    (0, logger_1.log)('Building intents...');
    const data = [];
    // const stemmer = new StemmerId();
    // stemmer.stopwords = new StopwordsId();
    // intent berdasar ayat & tokennya
    for (const v of corpus.id.verses) {
        // const token = stemmer.tokenizeAndStem(v.text);
        const utterances = [v.text.replace(/[^a-zA-Z ]/gi, ' ').toLowerCase()];
        const answers = [`${v.id}`];
        data.push({ intent: `verse_${v.id}`, utterances, answers });
    }
    // intent buat cari2 entity
    data.push({
        intent: 'chapter',
        utterances: ['surat @chapter', 'surat @chapter_no', '@chapter'],
        actions: [{ name: 'getChapter', parameters: ['@chapter', '@chapter_no'] }],
    });
    data.push({
        intent: 'verse',
        utterances: [
            'surat @chapter ayat @verse_no',
            'surat @chapter_no ayat @verse_no',
            'surat @chapter @verse_no',
            'surat @chapter_no @verse_no',
            '@chapter @verse_no',
            '@chapter_no @verse_no',
        ],
        actions: [
            {
                name: 'getVerse',
                parameters: ['@chapter', '@chapter_no', '@verse_no'],
            },
        ],
    });
    data.push({
        intent: 'verses',
        utterances: [
            'surat @chapter ayat @verse_range',
            'surat @chapter @verse_range',
            'surat @chapter_no @verse_range',
            '@chapter @verse_range',
        ],
        actions: [
            {
                name: 'getVerses',
                parameters: [
                    '@chapter',
                    '@chapter_no',
                    '@chapter_range',
                    '@verse_range',
                ],
            },
        ],
    });
    // perintah cari
    data.push({
        intent: 'search',
        utterances: ['cari @keywords', 'cari @keywords di @chapter'],
    });
    // perintah lanjut
    data.push({
        intent: 'next',
        utterances: ['lanjut', 'next'],
    });
    return data;
}
async function build() {
    const corpus = (0, qute_corpus_1.loadQuran)();
    const entities = await buildEntities(corpus.meta);
    const data = await buildIntents(corpus);
    await fs_extra_1.default.writeJson('corpus/quran-id.json', {
        name: 'Quran ID',
        locale: 'id-ID',
        data,
        entities,
    });
    (0, logger_1.log)('Building models...');
    await (0, nlp_1.initNlp)();
    (0, logger_1.log)('Building search index...');
    await (0, bot_1.initSearch)();
}
build();
