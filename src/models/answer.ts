import { Chapter, Verse } from 'qute-corpus';

export type ActionType =
  | 'search'
  | 'index'
  | 'next'
  | 'greeting'
  | 'random'
  | 'none';

export type SourceType = 'quran' | 'tafsir' | 'cache' | 'other';

export interface Answer {
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
