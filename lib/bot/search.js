"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchAnswer = getSearchAnswer;
exports.initSearch = initSearch;
const meilisearch_1 = __importDefault(require("meilisearch"));
const uuid_1 = require("uuid");
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("../logger");
const env_1 = __importDefault(require("../env"));
const { ar, id } = (0, qute_corpus_1.loadQuran)();
const { MEILI_ADDRESS, MEILI_KEY } = env_1.default;
async function getSearchAnswer(resp) {
    (0, logger_1.debug)('[BOT] getSearchAnswer');
    const answer = {
        id: (0, uuid_1.v4)(),
        time: Date.now(),
        source: 'quran',
        action: 'search',
        data: {
            verses: [],
            translations: [],
        },
    };
    // cari dulu di meili search engine
    const client = new meilisearch_1.default({
        host: MEILI_ADDRESS,
        apiKey: MEILI_KEY,
    });
    const result = await client
        .index('qute-verses_id')
        .search(resp.utterance, { attributesToRetrieve: ['id'] });
    result.hits.forEach((hit) => {
        answer.data.verses.push(ar.verses.find((v) => v.id === hit.id));
        answer.data.translations.push(id.verses.find((v) => v.id === hit.id));
    });
    // ambil jawaban2 dari classification nlp
    const answers = resp.classifications
        .filter((c) => c.score > 0)
        .sort((c1, c2) => (c1.score > c2.score ? 1 : -1));
    for (const alt of answers) {
        if (!alt.intent.startsWith('verse_'))
            continue;
        const index = alt.intent.split('verse_');
        const verseId = parseInt(index[1]);
        // jika sudah ada, skip
        if (result.hits.find((h) => h.id === verseId))
            continue;
        answer.data.verses.push(ar.verses.find((v) => v.id === verseId));
        answer.data.translations.push(id.verses.find((v) => v.id === verseId));
    }
    return answer;
}
async function initSearch() {
    (0, logger_1.log)(`[BOT] initSearch ${MEILI_ADDRESS}`);
    const client = new meilisearch_1.default({
        host: MEILI_ADDRESS,
        apiKey: MEILI_KEY,
    });
    let resp = await client
        .index('qute-verses_ar')
        .addDocuments(ar.verses, { primaryKey: 'id' });
    (0, logger_1.log)(`[BOT] initSearch:index verses-ar`, resp);
    resp = await client
        .index('qute-verses_id')
        .addDocuments(id.verses, { primaryKey: 'id' });
    (0, logger_1.log)(`[BOT] initSearch:index verses-id`, resp);
}
