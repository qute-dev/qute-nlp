import { randomUUID } from 'crypto';
import { debug } from '../logger';
import { Response, Message, PlatformType } from '../models';

export function getGreeting(resp: Response): Message {
  debug('[BOT] getGreeting', resp.intent);

  return {
    id: randomUUID(),
    time: Date.now(),
    source: 'other',
    action: 'greeting',
    text: resp.answer || resp.answers[0],
  };
}
