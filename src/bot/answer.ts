import { randomUUID } from 'crypto';
import { Response, Message, PlatformType } from '../models';
import { debug } from '../logger';
import { getGreeting } from './greeting';
import { getSearchAnswer } from './search';
import { getVerses } from './verse';

const records = new Map<string, { chapter: number; verse: number }>();

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

  return answer;
}

function getNextAnswer(user: string): Message {
  debug('[BOT] getNextAnswer', user);

  const last = records.get(user);

  if (!last) {
    return {
      id: randomUUID(),
      time: Date.now(),
      source: 'cache',
      action: 'next',
    };
  }

  const start = last.verse;
  const end = last.verse + 9;

  last.verse += 10;

  records.set(user, last);

  return getVerses(last.chapter, start, end);
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
    verseEnd = 10;

    records.set(user, { chapter, verse: 11 });
  }

  return getVerses(chapter, verseStart, verseEnd || verseStart);
}
