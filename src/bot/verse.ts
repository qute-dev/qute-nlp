import { loadQuran } from 'qute-corpus';

import { debug } from '../logger';
import { ActionType, Answer } from '../models';
import { formatAudioLink } from './utils';

const { ar, id, meta } = loadQuran();

export function getVerseRange(
  chapterNo: number,
  verseStart: number,
  verseEnd: number,
  action: ActionType = 'index'
): Answer {
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

  const audios = verses.map((verse) =>
    formatAudioLink(verse.chapter, verse.verse)
  );

  return {
    source: 'quran',
    action,
    data: {
      chapter,
      verses,
      translations,
      audios,
      next: true,
    },
  };
}

export function getVersesByIds(verseIds: number[]): Answer {
  const answer: Answer = {
    source: 'quran',
    action: 'index',
    data: {
      verses: [],
      translations: [],
      audios: [],
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

  answer.data.audios = answer.data.verses.map((verse) =>
    formatAudioLink(verse.chapter, verse.verse)
  );

  return answer;
}

export function getRandomVerse(): Answer {
  const randomIndex = Math.floor(Math.random() * ar.verses.length);
  const verse = ar.verses[randomIndex];
  const translation = id.verses[randomIndex];
  const audio = formatAudioLink(verse.chapter, verse.verse);

  return {
    source: 'quran',
    action: 'random',
    data: {
      chapter: id.chapters[verse.chapter - 1],
      verses: [verse],
      translations: [translation],
      audios: [audio],
      next: false,
    },
  };
}
