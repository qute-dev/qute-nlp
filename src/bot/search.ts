import MeiliSearch from 'meilisearch';
import { v4 as uuid } from 'uuid';
import { loadQuran } from 'qute-corpus';
import { debug, log } from '../logger';
import { Message, Response } from '../models';
import env from '../env';

const { ar, id } = loadQuran();
const { HOST, MEILI_ADDRESS, MEILI_KEY } = env;

export async function getSearchAnswer(resp: Response): Promise<Message> {
  debug('[BOT] getSearchAnswer');

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

  // cari dulu di meili search engine
  const client = new MeiliSearch({
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
    const index = alt.intent.split('verse_');
    const verseId = parseInt(index[1]);

    answer.data.verses.push(ar.verses.find((v) => v.id === verseId));
    answer.data.translations.push(id.verses.find((v) => v.id === verseId));
  }

  return answer;
}

export async function initSearch() {
  log(`[BOT] initSearch ${MEILI_ADDRESS}`);

  const client = new MeiliSearch({
    host: MEILI_ADDRESS,
    apiKey: MEILI_KEY,
  });

  let resp = await client
    .index('qute-verses_ar')
    .addDocuments(ar.verses, { primaryKey: 'id' });

  log(`[BOT] initSearch:index verses-ar`, resp);

  resp = await client
    .index('qute-verses_id')
    .addDocuments(id.verses, { primaryKey: 'id' });

  log(`[BOT] initSearch:index verses-id`, resp);
}
