import { v4 as uuid } from 'uuid';
import { loadQuran } from 'qute-corpus';

import { debug } from '../logger';
import { Message } from '../models';

const { ar, id, meta } = loadQuran();

export function getVerseRange(
  chapterNo: number,
  verseStart: number,
  verseEnd: number
): Message {
  debug('[BOT] getVerses', { chapterNo, verseStart, verseEnd });

  const chapter = id.chapters[chapterNo - 1];

  const verses = ar.verses.filter(
    (v) =>
      v.chapter === chapterNo && v.verse >= verseStart && v.verse <= verseEnd
  );

  const translations = id.verses.filter(
    (v) =>
      v.chapter === chapterNo && v.verse >= verseStart && v.verse <= verseEnd
  );

  return {
    id: uuid(),
    time: Date.now(),
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

export function getVersesByIds(verseIds: number[]): Message {
  const answer: Message = {
    id: uuid(),
    time: Date.now(),
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
