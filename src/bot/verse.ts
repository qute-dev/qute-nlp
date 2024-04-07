import { randomUUID } from 'crypto';
import { loadQuran } from 'qute-corpus';

import { debug } from '../logger';
import { Message } from '../models';

const { ar, id } = loadQuran();

export function getVerses(
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
    id: randomUUID(),
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

export function getVerse(verseId: number): Message {
  const verse = ar.verses.find((v) => v.id === verseId);
  const chapter = ar.chapters.find((c) => c.id === verse.chapter);

  return {
    id: randomUUID(),
    time: Date.now(),
    source: 'quran',
    action: 'index',
    data: {
      chapter,
      verses: [verse],
      translations: [id.verses.find((v) => v.id === verseId)],
      next: true,
    },
  };
}
