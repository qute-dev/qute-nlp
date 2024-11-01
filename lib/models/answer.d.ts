import { Chapter, Verse } from 'qute-corpus';
export type ActionType = 'search' | 'index' | 'next' | 'greeting' | 'none';
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
//# sourceMappingURL=answer.d.ts.map