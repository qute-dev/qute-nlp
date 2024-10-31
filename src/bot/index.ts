export { getAnswer, getCache } from './answer';
export { initSearch } from './search';
export { initNlp } from './nlp';

import { process } from './nlp';
import { getAnswer } from './answer';

export async function query(text: string, user = 'UNKNOWN') {
  const response = await process(text);
  const answer = await getAnswer(response, user);

  return answer;
}
