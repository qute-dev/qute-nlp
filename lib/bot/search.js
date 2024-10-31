"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchQuran = searchQuran;
exports.initSearch = initSearch;
const flexsearch_1 = require("flexsearch");
const qute_corpus_1 = require("qute-corpus");
const logger_1 = require("../logger");
const { ar, id } = (0, qute_corpus_1.loadQuran)();
const quranId = new flexsearch_1.Document({
    preset: 'score',
    language: 'id',
    worker: true,
    document: {
        id: 'id',
        index: ['text'],
    },
});
async function searchQuran(query) {
    (0, logger_1.debug)(`[BOT] searchQuran: ${query}`);
    const answer = {
        source: 'quran',
        action: 'search',
        data: {
            verses: [],
            translations: [],
        },
    };
    const queries = [...new Set([query, ...query.trim().split(' ')])];
    let results = [];
    // debug(`[BOT] searchQuran:queries`, queries);
    for (const keyword of queries) {
        const keyResult = await quranId.searchAsync(keyword);
        // debug(`[BOT] searchQuran:keywordResult`, keyResult);
        const ayatsResult = (keyResult === null || keyResult === void 0 ? void 0 : keyResult.length) && keyResult[0].result.map((r) => r);
        results.push(...(ayatsResult || []));
    }
    // jangan sampe dobel
    results = [...new Set(results)];
    (0, logger_1.debug)(`[BOT] searchQuran:results -> ${results === null || results === void 0 ? void 0 : results.length}`);
    results.forEach((rid) => {
        answer.data.verses.push(ar.verses.find((v) => v.id === rid));
        answer.data.translations.push(id.verses.find((v) => v.id === rid));
    });
    return answer;
}
async function initSearch() {
    // TODO: search arabic
    // log(`[BOT] initSearch:index verses-ar`);
    // for (const verse of ar.verses) {
    //   await quranAr.addAsync(verse.id, verse);
    // }
    (0, logger_1.log)(`[BOT] initSearch:index verses-id`);
    for (const verse of id.verses) {
        await quranId.addAsync(verse.id, verse);
    }
}
