import { v4 as uuid } from 'uuid';
import { debug } from '../logger';
import { Response, Message } from '../models';

export function getGreeting(resp: Response): Message {
  debug('[BOT] getGreeting', resp.intent);

  return {
    id: uuid(),
    time: Date.now(),
    source: 'other',
    action: 'greeting',
    text: resp.answer || resp.answers[0],
  };
}
