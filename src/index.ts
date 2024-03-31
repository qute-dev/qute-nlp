import * as nlp from './nlp';

async function main() {
  await nlp.init();
  const resp = await nlp.process('baqara');
  console.log(resp);
}

main();
