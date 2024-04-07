import 'dotenv/config';

import assert from 'assert';

import * as nlp from './nlp';
import * as bot from './bot';
import { Message } from './models';
import { debug, log } from './logger';

async function testQuestion(text: string) {
  const resp = await nlp.process(text);
  const answer = await bot.getAnswer(resp);

  log(`[TEST] ${text} -> ${answer.text || answer.data?.translations.length}`);

  debug('[TEST] intent:', resp.intent);
  debug('[TEST] entities:', resp.entities);
  debug('[TEST] classifications:', resp.classifications);
  debug('[TEST] answer details:', answer.data?.translations);

  return answer;
}

async function testQuran() {
  let answer: Message;

  // surat
  answer = await testQuestion('surat albaqara');
  assert(answer.data.chapter.id === 2);

  // surat simple
  answer = await testQuestion('baqara');
  assert(answer.data.chapter.id === 2);

  // lanjut
  answer = await testQuestion('lanjut');
  assert(answer.data.chapter.id === 2 && answer.data.verses.length === 10);

  // ayat lengkap
  answer = await testQuestion('surat alfatihah ayat 5');
  assert(answer.data.chapter.id === 1 && answer.data.verses.length === 1);

  // ayat simple
  answer = await testQuestion('alfatihah 5');
  assert(answer.data.chapter.id === 1 && answer.data.verses.length === 1);

  // ayat range
  answer = await testQuestion('maidah 1-7');
  assert(answer.data.chapter.id === 5 && answer.data.verses.length === 7);

  // cari
  answer = await testQuestion('surga neraka');
  assert(!answer.data.chapter && answer.data.verses.length > 0);
}

async function testGreeting() {
  let answer: Message;

  // sapaan
  answer = await testQuestion('halo');
  assert(!!answer.text);

  // salam
  answer = await testQuestion('assalamualaikum');
  assert(!!answer.text);
}

async function runTest() {
  await nlp.init();
  await testGreeting();
  await testQuran();
}

runTest();
