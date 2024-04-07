import * as nlp from './nlp';
import * as bot from './bot';

async function test() {
  await nlp.init();

  const resp = await nlp.process('baqara');
  const answer = await bot.getAnswer(resp);

  console.log(resp);
  console.log(answer);
}

test();
