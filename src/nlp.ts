import fse from 'fs-extra';
import path from 'path';
import { Nlp, dockStart } from '@nlpjs/basic';

import { Response } from './models';

let nlp: Nlp;

export async function init() {
  fse.ensureDirSync('dist');

  const config = fse.readJsonSync(path.join(__dirname, 'conf.json'));
  const dock = await dockStart(config);

  nlp = dock.get('nlp') as Nlp;

  await nlp.loadOrTrain();
}

export async function process(text: string) {
  return (await nlp.process('id', text)) as Response;
}

export async function train() {
  await nlp.train();
}
