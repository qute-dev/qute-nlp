import { Document } from 'flexsearch';
import { loadQuran } from 'qute-corpus';
import { debug, log } from '../logger';
import { Answer } from '../models';

const { ar, id } = loadQuran();

const quranId = new Document({
  preset: 'score',
  language: 'id',
  worker: true,
  document: {
    id: 'id',
    index: ['text'],
  },
});

export async function searchQuran(query: string): Promise<Answer> {
  debug(`[BOT] searchQuran: ${query}`);

  const answer: Answer = {
    source: 'quran',
    action: 'search',
    data: {
      verses: [],
      translations: [],
    },
  };

  const queries = [query, ...query.trim().split(' ')];
  const results: number[] = [];

  for (const q of queries) {
    const result = await quranId.searchAsync(q, { bool: 'or' });
    results.push(...result[0].result.map((r) => r as number));
  }

  debug(`[BOT] searchQuran:result -> ${results?.length}`);

  results.forEach((rid) => {
    answer.data.verses.push(ar.verses.find((v) => v.id === rid));
    answer.data.translations.push(id.verses.find((v) => v.id === rid));
  });

  return answer;
}

export async function initSearch() {
  // TODO: search arabic
  // log(`[BOT] initSearch:index verses-ar`);
  // for (const verse of ar.verses) {
  //   await quranAr.addAsync(verse.id, verse);
  // }

  log(`[BOT] initSearch:index verses-id`);
  for (const verse of id.verses) {
    await quranId.addAsync(verse.id, verse);
  }
}
