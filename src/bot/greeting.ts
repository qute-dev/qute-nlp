import { debug } from '../logger';
import { Response, Answer } from '../models';

export function getGreeting(resp: Response): Answer {
  debug('[BOT] getGreeting', { intent: resp.intent });

  return {
    source: 'other',
    action: 'greeting',
    text: resp.answer || resp.answers[0],
  };
}
