import 'dotenv/config';

import assert from 'assert';

import * as nlp from './nlp';
import * as bot from './bot';
import { BotAnswer } from './models';
import { debug, log } from './logger';

async function testQuestion(text: string) {
  log('[TEST]', text);

  const resp = await nlp.process(text);
  const answer = await bot.getAnswer(resp);

  debug('[TEST] intent:', resp.intent);
  debug('[TEST] entities:', resp.entities);
  debug('[TEST] classifications:', resp.classifications);
  debug('[TEST] answer:', answer.translations);

  return answer;
}

async function runTest() {
  await nlp.init();

  let answer: BotAnswer;

  // surat
  answer = await testQuestion('surat albaqara');
  assert(answer.chapter.id === 2);

  // surat simple
  answer = await testQuestion('baqara');
  assert(answer.chapter.id === 2);

  // lanjut
  answer = await testQuestion('lanjut');
  assert(answer.chapter.id === 2 && answer.verses.length === 10);

  // ayat lengkap
  answer = await testQuestion('surat alfatihah ayat 5');
  assert(answer.chapter.id === 1 && answer.verses.length === 1);

  // ayat simple
  answer = await testQuestion('alfatihah 5');
  assert(answer.chapter.id === 1 && answer.verses.length === 1);

  // ayat range
  answer = await testQuestion('maidah 1-7');
  assert(answer.chapter.id === 5 && answer.verses.length === 7);

  // cari
  answer = await testQuestion('surga neraka');
  assert(!answer.chapter && answer.verses.length > 0);
}

runTest();
