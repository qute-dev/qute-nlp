import { randomUUID } from 'crypto';
import { loadQuran } from 'qute-corpus';
import { debug } from '../logger';
import { Message, PlatformType } from '../models';

const { ar, id } = loadQuran();

export function getSearchAnswer(classifications: any[]): Message {
  debug('[BOT] getSearchAnswer');

  const alts = classifications
    .filter((c) => c.score > 0)
    .sort((c1, c2) => (c1.score > c2.score ? 1 : -1));

  const answer: Message = {
    id: randomUUID(),
    time: Date.now(),
    source: 'quran',
    action: 'search',
    data: {
      verses: [],
      translations: [],
      next: false,
    },
  };

  for (const alt of alts) {
    const index = alt.intent.split('verse_');
    const verseId = parseInt(index[1]);

    answer.data.verses.push(ar.verses.find((v) => v.id === verseId));
    answer.data.translations.push(id.verses.find((v) => v.id === verseId));
  }

  return answer;
}
