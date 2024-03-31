import fse from 'fs-extra';
import path from 'path';
import { Nlp, dockStart } from '@nlpjs/basic';

async function main() {
  const config = fse.readJsonSync(path.join(__dirname, 'conf.json'));
  const dock = await dockStart(config);
  const nlp = dock.get('nlp') as Nlp;

  await nlp.loadOrTrain();

  const resp = await nlp.process('id', 'halo');

  console.log(resp);
}

main();
