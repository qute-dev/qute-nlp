import { Chapter, Verse } from 'qute-corpus';
import { PlatformType, SourceType, ActionType } from './types';

export interface Message {
  id?: string;
  time?: number;
  platform?: PlatformType;
  from?: 'me' | 'bot' | string;
  source?: SourceType;
  action?: ActionType;
  text?: string;
  data?: {
    chapter?: Chapter;
    verses?: Verse[];
    translations?: Verse[];
    next?: boolean;
  };
}
