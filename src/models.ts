import { Chapter, Verse } from 'qute-corpus';

export interface BotAnswer {
  source: 'quran' | 'tafsir';
  action: 'search' | 'index';
  chapter?: Chapter;
  verses: Verse[];
  translations: Verse[];
  next?: boolean;
}

export interface NlpReponse {
  locale: 'id' | 'en' | 'ar';
  utterance: string;
  settings: any;
  languageGuessed: boolean;
  localeIso2: 'id' | 'en' | 'ar';
  language: string;
  nluAnswer: {
    classifications: any[];
    entities: any[];
    explanation: any[];
  };
  explanation: { token: string; stem: string; weight: number }[];
  classifications: { intent: string; score: boolean }[];
  intent: string;
  score: 1;
  domain: 'default' | any;
  optionalUtterance: string;
  sourceEntities: any[];
  entities: {
    start: number;
    end: number;
    len: number;
    levenshtein: number;
    accuracy: number;
    entity: string;
    type: string;
    option: string;
    sourceText: string;
    utteranceText: string;
  }[];
  answers: any[];
  answer: any;
  actions: { action: string; parameters: any[] }[];
  sentiment: {
    score: number;
    numWords: number;
    numHits: number;
    average: number;
    type: string;
    locale: string;
    vote: string;
  };
}
