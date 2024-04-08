import 'dotenv/config';

import fse from 'fs-extra';
import { Meta, Quran, loadQuran } from 'qute-corpus';

import { log } from './logger';
import { init } from './nlp';
import { initSearch } from './bot';

async function buildEntities(meta: Meta) {
  log('Building entities...');

  const options: any = {};

  // entities surah: al ikhlas, fatihah
  for (const c of meta.chapters) {
    const name = c.name.toLowerCase();

    options[c.id] = [
      name.replace('-', ' '), // ganti - ke spasi
      name.replace(/[\s\-]/g, ''), // hilangkan spasi dan -
      name.replace(/.+[\s\-]/, '').replace(/\W/gi, ''), // hilangkan spasi di awal & karakter lains
    ];
  }

  const regexEntities = {
    verse_no: '/\\s+\\d+$/gi', // ex: al fatihah 3
    verse_range: '/\\d+\\s*\\-\\s*\\d+$/gi', // ex: al baqarah 1-5
    chapter_no: '/\\s+\\d+\\s*?/gi', // ex: surat 13 2-3
    chapter_start_no: '/^\\d+\\s.*?/gi', // ex: 13 2
  };

  return { chapter: { options }, ...regexEntities };
}

function buildIntents(corpus: { meta: Meta; ar: Quran; id: Quran }): any[] {
  log('Building intents...');

  const data: {
    intent: string;
    utterances: string[];
    answers?: string[];
    actions?: { name: string; parameters: string[] }[];
  }[] = [];

  // const stemmer = new StemmerId();
  // stemmer.stopwords = new StopwordsId();

  // intent berdasar ayat & tokennya
  for (const v of corpus.id.verses) {
    // const token = stemmer.tokenizeAndStem(v.text);
    const utterances = [v.text.replace(/[^a-zA-Z ]/gi, ' ').toLowerCase()];
    const answers = [`${v.id}`];

    data.push({ intent: `verse_${v.id}`, utterances, answers });
  }

  // intent buat cari2 entity
  data.push({
    intent: 'chapter',
    utterances: ['surat @chapter', 'surat @chapter_no', '@chapter'],
    actions: [{ name: 'getChapter', parameters: ['@chapter', '@chapter_no'] }],
  });

  data.push({
    intent: 'verse',
    utterances: [
      'surat @chapter ayat @verse_no',
      'surat @chapter_no ayat @verse_no',
      'surat @chapter @verse_no',
      'surat @chapter_no @verse_no',
      '@chapter @verse_no',
      '@chapter_no @verse_no',
    ],
    actions: [
      {
        name: 'getVerse',
        parameters: ['@chapter', '@chapter_no', '@verse_no'],
      },
    ],
  });

  data.push({
    intent: 'verses',
    utterances: [
      'surat @chapter ayat @verse_range',
      'surat @chapter @verse_range',
      'surat @chapter_no @verse_range',
      '@chapter @verse_range',
    ],
    actions: [
      {
        name: 'getVerses',
        parameters: [
          '@chapter',
          '@chapter_no',
          '@chapter_range',
          '@verse_range',
        ],
      },
    ],
  });

  // perintah lanjut
  data.push({
    intent: 'next',
    utterances: ['lanjut', 'next'],
  });

  return data;
}

async function build() {
  const corpus = loadQuran();
  const entities = await buildEntities(corpus.meta);
  const data = await buildIntents(corpus);

  await fse.writeJson('corpus/quran-id.json', {
    name: 'Quran ID',
    locale: 'id-ID',
    data,
    entities,
  });

  log('Building models...');
  await init();

  log('Building search index...');
  await initSearch();
}

build();
