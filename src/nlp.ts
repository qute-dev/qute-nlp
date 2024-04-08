import fse from 'fs-extra';
import path from 'path';
import { Nlp, dockStart } from '@nlpjs/basic';

import { Response } from './models';
import { log } from './logger';

let nlp: Nlp;

export async function initNlp() {
  log('[nlp] Initializing NLP...');

  await fse.ensureDir('dist');

  const config = await fse.readJson(path.join(__dirname, 'conf.json'));
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
