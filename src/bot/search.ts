import { Document } from 'flexsearch';
import { v4 as uuid } from 'uuid';
import { loadQuran } from 'qute-corpus';
import { debug, log } from '../logger';
import { Message, Response } from '../models';

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

export async function searchQuran(resp: Response): Promise<Message> {
  debug('[BOT] searchVerses');

  const answer: Message = {
    id: uuid(),
    time: Date.now(),
    source: 'quran',
    action: 'search',
    data: {
      verses: [],
      translations: [],
    },
  };

  // cari dulu di search engine
  const results = await quranId.searchAsync(resp.utterance);
  const result = results.length ? results[0].result : [];

  result.forEach((sid) => {
    answer.data.verses.push(ar.verses.find((v) => v.id === sid));
    answer.data.translations.push(id.verses.find((v) => v.id === sid));
  });

  // ambil jawaban2 dari classification nlp
  const answers = resp.classifications
    .filter((c) => c.score > 0)
    .sort((c1, c2) => (c1.score > c2.score ? 1 : -1));

  for (const alt of answers) {
    if (!alt.intent.startsWith('verse_')) continue;

    const index = alt.intent.split('verse_');
    const verseId = parseInt(index[1]);

    // jika sudah ada, skip
    if (result.find((h) => h === verseId)) continue;

    answer.data.verses.push(ar.verses.find((v) => v.id === verseId));
    answer.data.translations.push(id.verses.find((v) => v.id === verseId));
  }

  return answer;
}

export async function initSearch() {
  // log(`[BOT] initSearch:index verses-ar`);
  // for (const verse of ar.verses) {
  //   await quranAr.addAsync(verse.id, verse);
  // }

  log(`[BOT] initSearch:index verses-id`);
  for (const verse of id.verses) {
    await quranId.addAsync(verse.id, verse);
  }
}
