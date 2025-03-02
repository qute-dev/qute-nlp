import * as readline from 'readline';

import { error, log } from './logger';
import { initNlp, process as processAnswer } from './bot/nlp';
import { getCache, getAnswer } from './bot/answer';
import { initSearch } from './bot/search';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function handleQuestion(input: string) {
  if (input.toLowerCase() === 'exit') {
    log('Session ended.');
    rl.close();
    process.exit(0);
  }

  try {
    const resp = await processAnswer(input);
    const answer = await getAnswer(resp, 'CONSOLE');

    console.log(answer.text || answer);
  } catch (err) {
    error('Error processing answer:', err);
  }

  promptUser();
}

function promptUser() {
  rl.question('> ', handleQuestion);
}

async function start() {
  await initNlp();
  await initSearch();

  console.log('Welcome to Qute-NLP testing console!');
  console.log('Enter your query or "exit" to end session.');
  promptUser();
}

start();
