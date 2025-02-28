import 'dotenv/config';

import assert from 'assert';

import { Answer } from './models';
import { debug, log } from './logger';
import { initNlp, process as processAnswer } from './bot/nlp';
import { getCache, getAnswer } from './bot/answer';
import { initSearch } from './bot/search';

async function testQuestion(text: string) {
  const resp = await processAnswer(text);
  const answer = await getAnswer(resp, 'TEST');

  log(`[TEST] ${text} -> ${answer.text || answer.data?.translations.length}`);

  debug(`[TEST] intent: ${resp.intent}`);
  debug('[TEST] entities:', resp.entities);
  // debug('[TEST] answer details:', answer.data?.translations);

  return answer;
}

async function testGreeting() {
  let answer: Answer;

  // sapaan
  answer = await testQuestion('halo');
  assert(!!answer.text);

  // salam
  answer = await testQuestion('assalamualaikum');
  assert(!!answer.text);
}

async function testIndex() {
  let answer: Answer;

  // surat
  answer = await testQuestion('surat albaqara');
  assert(answer.data.chapter.id === 2);

  // surat simple
  answer = await testQuestion('baqara');
  assert(
    answer.data.chapter.id === 2 &&
      answer.data.verses.length === 10 &&
      answer.data.translations.length === 10
  );

  // lanjut
  answer = await testQuestion('lanjut');
  assert(
    answer.data.chapter.id === 2 &&
      answer.data.verses.length === 10 &&
      answer.data.translations.length === 10
  );

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
}

async function testSearch() {
  let answer: Answer;

  // dg cari
  answer = await testQuestion('cari manusia');
  assert(!answer.data.chapter && answer.data.verses.length === 10);

  // dg cari nama surat
  answer = await testQuestion('cari maryam');
  assert(!answer.data.chapter && answer.data.verses.length === 10);

  // cari kata cari
  answer = await testQuestion('cari mencari');
  assert(!answer.data.chapter && answer.data.verses.length > 0);

  // jodoh
  answer = await testQuestion('jodoh');
  assert(!answer.data.chapter && answer.data.verses.length === 0);

  // dg cari jodoh
  answer = await testQuestion('cari jodoh');
  assert(!answer.data.chapter && answer.data.verses.length === 0);

  // tanpa kata cari
  answer = await testQuestion('surga neraka');
  assert(!answer.data.chapter && answer.data.verses.length === 10);

  // next hasil cari
  answer = await testQuestion('next');
  assert(!answer.data.chapter && answer.data.verses.length === 10);

  // cari yg ga ada
  answer = await testQuestion('pacul');
  assert(!answer.data.chapter && answer.data.verses.length === 0);

  // TODO: cari di surat tertentu
  // answer = await testQuestion('cari allah di al baqarah');
  // assert(answer.data.chapter && answer.data.verses.length > 1);
}

async function testCache() {
  let answer: Answer;
  let cache: any;

  // surat
  answer = await testQuestion('surat albaqara');
  assert(answer.data.chapter.id === 2 && answer.data.verses.length === 10);

  // cek cache
  cache = await getCache();
  assert(cache['TEST'].length === answer.data.chapter.verses - 10);

  for (let i = 2; i <= 5; i++) {
    // lanjut
    answer = await testQuestion('lanjut');
    assert(answer.data.chapter.id === 2 && answer.data.verses.length === 10);

    // cek cache lagi
    cache = await getCache();
    assert(cache['TEST'].length === answer.data.chapter.verses - 10 * i);
  }
}

async function runTest() {
  await initNlp();
  await initSearch();

  await testGreeting();
  await testIndex();
  await testSearch();
  await testCache();

  process.exit(0);
}

runTest();
