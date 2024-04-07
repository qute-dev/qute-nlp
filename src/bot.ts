import { randomUUID } from 'crypto';
import { loadQuran } from 'qute-corpus';
import { BotMessage, NlpReponse } from './models';
import { debug } from './logger';

const { ar, id } = loadQuran();

const records = new Map<string, { chapter: number; verse: number }>();

function getVerses(
  chapterNo: number,
  verseStart: number,
  verseEnd: number,
  user: string
): BotMessage {
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
    platform: 'web',
    user,
    source: 'quran',
    action: 'index',
    chapter,
    verses,
    translations,
    next: true,
  };
}

function getVerse(verseId: number, user: string): BotMessage {
  const verse = ar.verses.find((v) => v.id === verseId);
  const chapter = ar.chapters.find((c) => c.id === verse.chapter);

  return {
    id: randomUUID(),
    time: Date.now(),
    platform: 'web',
    user,
    source: 'quran',
    action: 'index',
    chapter,
    verses: [verse],
    translations: [id.verses.find((v) => v.id === verseId)],
    next: true,
  };
}

function getNextAnswer(user: string): BotMessage {
  debug('[BOT] getNextAnswer', user);

  const last = records.get(user);

  if (!last) {
    return {
      id: randomUUID(),
      time: Date.now(),
      platform: 'web',
      user,
      source: 'quran',
      action: 'index',
      chapter: null,
      verses: [],
      translations: [],
      next: false,
    };
  }

  const start = last.verse;
  const end = last.verse + 9;

  last.verse += 10;

  records.set(user, last);

  return getVerses(last.chapter, start, end, user);
}

function getSearchAnswer(classifications: any[], user: string): BotMessage {
  debug('[BOT] getSearchAnswer');

  const alts = classifications
    .filter((c) => c.score > 0)
    .sort((c1, c2) => (c1.score > c2.score ? 1 : -1));

  const answer: BotMessage = {
    id: randomUUID(),
    time: Date.now(),
    platform: 'web',
    user,
    source: 'quran',
    action: 'search',
    verses: [],
    translations: [],
    next: false,
  };

  for (const alt of alts) {
    const index = alt.intent.split('verse_');
    const verseId = parseInt(index[1]);

    answer.verses.push(ar.verses.find((v) => v.id === verseId));
    answer.translations.push(id.verses.find((v) => v.id === verseId));
  }

  return answer;
}

function getGreeting(resp: NlpReponse, user: string): BotMessage {
  debug('[BOT] getGreeting', resp.intent);

  return {
    id: randomUUID(),
    time: Date.now(),
    platform: 'web',
    user,
    source: 'other',
    action: 'greeting',
    message: resp.answer || resp.answers[0],
    next: false,
  };
}

export async function getAnswer(
  resp: NlpReponse,
  user = 'DEFAULT'
): Promise<BotMessage> {
  const { intent, entities } = resp;

  // greeting
  if (intent.startsWith('greeting')) return getGreeting(resp, user);

  // lanjut sesuai record
  if (intent === 'next') return getNextAnswer(user);

  // satu ayat saja
  // if (intent.startsWith('verse_'))
  //   return getVerse(parseInt(intent.split('_')[1]));

  // ga ada entity kedetek, berarti pencarian
  if (!entities.length) return getSearchAnswer(resp.classifications, user);

  const verseEntity = entities.filter(
    (e) => e.entity === 'verse_no' && e.accuracy >= 0.1
  );
  const verseRangeEntity = entities.filter(
    (e) => e.entity === 'verse_range' && e.accuracy >= 0.1
  );
  const chapterNoEntity = entities.filter(
    (e) => e.entity === 'chapter_no' && e.accuracy >= 0.1
  );
  const chapterEntity = entities.filter(
    (e) => e.entity === 'chapter' && e.accuracy >= 0.7
  );

  const ents = {
    verseEntity,
    verseRangeEntity,
    chapterNoEntity,
    chapterEntity,
  };

  debug('[BOT] getAnswer:entities', ents);

  let chapter = 0;
  let verseStart = 0;
  let verseEnd = 0;

  // banyak ayat
  if (verseRangeEntity.length) {
    const ayats = verseRangeEntity[0].sourceText.split('-');
    verseStart = parseInt(ayats[0].trim());
    verseEnd = parseInt(ayats[1].trim());
  } else if (verseEntity.length) {
    // ini kalau cuma 1 ayat aja
    verseStart = parseInt(verseEntity[0].sourceText.trim());
  }

  // ambil info surat
  if (chapterEntity.length) {
    chapter = parseInt(chapterEntity[0].option);
  } else if (chapterNoEntity.length) {
    // ini cuma nomor surat aja
    chapter = parseInt(chapterNoEntity[0].sourceText.trim());

    // nomor jgn dianggap ayat, tp sbg no surat
    if (
      verseEntity.length &&
      verseEntity[0].start === chapterNoEntity[0].start
    ) {
      verseStart = verseEnd = 0;
    }
  }

  // batasi max ayat kalau surat yg tampil
  if (!verseStart && !verseEnd) {
    verseStart = 1;
    verseEnd = 10;

    records.set(user, { chapter, verse: 11 });
  }

  return getVerses(chapter, verseStart, verseEnd || verseStart, user);
}
