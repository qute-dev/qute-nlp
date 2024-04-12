import { v4 as uuid } from 'uuid';
import { loadQuran } from 'qute-corpus';
import { Response, Message, PlatformType } from '../models';
import { debug, log } from '../logger';
import { getGreeting } from './greeting';
import { getSearchAnswer } from './search';
import { getVerseRange, getVersesByIds } from './verse';

const { meta } = loadQuran();

const records = new Map<string, number[]>(); // user => [verseId]

export function getCache() {
  const cache = {} as any;

  records.forEach((verseIds, user) => {
    cache[user] = verseIds;
  });

  return cache;
}

export async function getAnswer(
  resp: Response,
  user = 'UNKNOWN',
  platform: PlatformType = 'web'
): Promise<Message> {
  const { intent, entities } = resp;

  let answer: Message = {};

  const keywordsEntity = entities.filter(
    (e) => e.entity === 'keywords' && e.accuracy >= 0.1
  );

  // greeting
  if (intent.startsWith('greeting')) {
    records.delete(user);
    answer = getGreeting(resp);
  }
  // lanjut sesuai record
  else if (intent === 'next') {
    answer = getNextAnswer(user);
  }
  // ada entity keyword search
  else if (keywordsEntity.length) {
    records.delete(user);
    resp.utterance = keywordsEntity[0].sourceText.replace('cari', '').trim();
    answer = await getSearchAnswer(resp);
  }
  // ga ada entity kedetek, berarti pencarian
  else if (!entities.length) {
    records.delete(user);
    answer = await getSearchAnswer(resp);
  }
  // cari di entity2
  else {
    records.delete(user);
    answer = getEntityAnswer(entities);
  }

  answer.from = 'bot';
  answer.platform = platform;

  if (answer.data?.verses?.length > 10) {
    answer.data.next = true;

    // 10 terakhir
    const nexts = answer.data.verses.splice(10, answer.data.verses.length - 10);
    answer.data.translations.splice(10, answer.data.verses.length - 10);

    debug(`[BOT] nexts ${nexts.length}`);

    // simpan ke record
    const verseIds = nexts.filter((v) => !!v).map((v) => v.id);

    records.set(user, verseIds);
  } else if (answer.data) {
    // jawaban kurang dari 10, ga perlu next
    answer.data.next = false;
    records.delete(user);
  }

  // ga ada ayat
  if (!answer.data?.verses?.length) {
    answer.text = 'Data tidak ditemukan';
  }

  return answer;
}

function getNextAnswer(user: string): Message {
  debug('[BOT] getNextAnswer', user);

  const lasts = records.get(user);

  if (!lasts || !lasts.length) {
    return {
      id: uuid(),
      time: Date.now(),
      source: 'cache',
      action: 'none',
      text: 'Data tidak ditemukan',
    };
  }

  return getVersesByIds(lasts);
}

function getEntityAnswer(entities: any[]): Message {
  const verseEntity = entities.filter(
    (e) => e.entity === 'verse_no' && e.accuracy >= 0.1
  );
  const verseRangeEntity = entities.filter(
    (e) => e.entity === 'verse_range' && e.accuracy >= 0.1
  );
  const chapterNoEntity = entities.filter(
    (e) =>
      (e.entity === 'chapter_no' || e.entity === 'chapter_start_no') &&
      e.accuracy >= 0.1
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
    verseEnd = meta.chapters[chapter - 1]?.verses;
  }

  return getVerseRange(chapter, verseStart, verseEnd || verseStart);
}
