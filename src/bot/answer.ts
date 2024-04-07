import { v4 as uuid } from 'uuid';
import { loadQuran } from 'qute-corpus';
import { Response, Message, PlatformType } from '../models';
import { debug } from '../logger';
import { getGreeting } from './greeting';
import { getSearchAnswer } from './search';
import { getVerseRange, getVersesByIds } from './verse';

const { meta } = loadQuran();

const records = new Map<string, number[]>(); // user => [verseId]

export async function getAnswer(
  resp: Response,
  user = 'UNKNOWN',
  platform: PlatformType = 'web'
): Promise<Message> {
  const { intent, entities } = resp;

  let answer: Message = {};

  // greeting
  if (intent.startsWith('greeting')) answer = getGreeting(resp);
  // lanjut sesuai record
  else if (intent === 'next') answer = getNextAnswer(user);
  // ga ada entity kedetek, berarti pencarian
  else if (!entities.length) answer = getSearchAnswer(resp.classifications);
  // cari di entity2
  else answer = getEntityAnswer(entities, user);

  answer.from = 'bot';
  answer.platform = platform;

  if (answer.data?.verses?.length > 10) {
    // 10 terakhir
    const nexts = answer.data.verses.splice(10, answer.data.verses.length - 10);
    answer.data.translations.splice(10, answer.data.verses.length - 10);

    // simpan ke record
    const verseIds = nexts.map((v) => v.id);

    records.set(user, verseIds);
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
    };
  }

  const verseIds = lasts.splice(0, 10);

  if (lasts.length) records.set(user, lasts);
  else records.delete(user);

  return getVersesByIds(verseIds);
}

function getEntityAnswer(entities: any[], user: string): Message {
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
    verseEnd = meta.chapters[chapter - 1].verses;
  }

  return getVerseRange(chapter, verseStart, verseEnd || verseStart);
}
