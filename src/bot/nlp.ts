import path from 'path';
import { Nlp, dockStart } from '@nlpjs/basic';

import { Response } from '../models';
import { log } from '../logger';

let nlp: Nlp;

export async function initNlp() {
  log(`[nlp] Initializing NLP...`);

  const config = await getConfig();
  const dock = await dockStart(config);

  nlp = dock.get('nlp') as Nlp;

  log('[nlp] Load or train NLP...');
  await nlp.loadOrTrain();
}

export async function process(text: string) {
  return (await nlp.process('id', text)) as Response;
}

export async function train() {
  log('[nlp] Training NLP...');
  await nlp.train();
}

async function getConfig() {
  const corpusDir = path.join(__dirname, '..', '..', 'corpus');
  const modelDir = path.join(__dirname, '..', '..', 'lib');

  log(`[nlp] Corpus: ${corpusDir}`);
  log(`[nlp] Model: ${modelDir}`);

  return {
    settings: {
      nlp: {
        threshold: 0.9,
        autoLoad: true,
        autoSave: true,
        modelFileName: path.join(modelDir, 'model.nlp'),
        corpora: [
          path.join(corpusDir, 'greeting.json'),
          path.join(corpusDir, 'quran-id.json'),
        ],
      },
    },
    use: ['Basic', 'LangId'],
  };
}
