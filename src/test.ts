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
  // debug('[TEST] classifications:', resp.classifications);
  // debug('[TEST] answer details:', answer.data?.translations);

  return answer;
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

  // ayat angka
  answer = await testQuestion('surat 2 ayat 10');
  assert(answer.data.chapter.id === 2 && answer.data.verses.length === 1);

  // ayat simple
  answer = await testQuestion('alfatihah 5');
  assert(answer.data.chapter.id === 1 && answer.data.verses.length === 1);

  // ayat tersimpel
  answer = await testQuestion('2 185');
  assert(answer.data.chapter.id === 2 && answer.data.verses.length === 1);

  // ayat range
  answer = await testQuestion('maidah 1-7');
  assert(answer.data.chapter.id === 5 && answer.data.verses.length === 7);

  // ayat range simple
  answer = await testQuestion('11 2-4');
  assert(answer.data.chapter.id === 11 && answer.data.verses.length === 3);

  // cari
  answer = await testQuestion('surga neraka');
  assert(!answer.data.chapter && answer.data.verses.length === 10);

  // next hasil cari
  answer = await testQuestion('next');
  assert(!answer.data.chapter && answer.data.verses.length === 10);
}

async function testCache() {
  let answer: Message;
  let cache: any;

  // surat
  answer = await testQuestion('surat albaqara');
  assert(answer.data.chapter.id === 2 && answer.data.verses.length === 10);

  // cek cache
  cache = await bot.getCache();
  assert(cache['UNKNOWN'].length === answer.data.chapter.verses - 10);

  for (let i = 2; i <= 5; i++) {
    // lanjut
    answer = await testQuestion('lanjut');
    assert(answer.data.chapter.id === 2 && answer.data.verses.length === 10);

    // cek cache lagi
    cache = await bot.getCache();
    assert(cache['UNKNOWN'].length === answer.data.chapter.verses - 10 * i);
  }
}

async function runTest() {
  await nlp.init();
  await testGreeting();
  await testQuran();
  await testCache();
}

runTest();
