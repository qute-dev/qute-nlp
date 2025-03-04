import { Chapter, TafsirVerse, Verse } from 'qute-corpus';
export type ActionType = 'search' | 'index' | 'random' | 'tafsir' | 'audio' | 'greeting' | 'next' | 'none';
export type SourceType = 'quran' | 'tafsir' | 'cache' | 'other';
export interface Answer {
    source?: SourceType;
    action?: ActionType;
    text?: string;
    data?: {
        chapter?: Chapter;
        verses?: Verse[];
        translations?: Verse[];
        tafsirs?: TafsirVerse[];
        audios?: string[];
        next?: boolean;
    };
}
//# sourceMappingURL=answer.d.ts.map