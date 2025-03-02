import { Chapter, Verse } from 'qute-corpus';

export type ActionType =
  | 'search'
  | 'index'
  | 'next'
  | 'greeting'
  | 'random'
  | 'audio'
  | 'none';

export type SourceType = 'quran' | 'tafsir' | 'cache' | 'audio' | 'other';

export interface Answer {
  source?: SourceType;
  action?: ActionType;
  text?: string;
  data?: {
    chapter?: Chapter;
    verses?: Verse[];
    translations?: Verse[];
    audios?: string[];
    next?: boolean;
  };
}
