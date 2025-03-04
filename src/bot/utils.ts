import { Verse, loadQuran } from 'qute-corpus';

const { meta } = loadQuran();

export function formatAudioLink(chapter: number, verse: number): string {
  const chapterStr = chapter.toString().padStart(3, '0');
  const verseStr = verse.toString().padStart(3, '0');

  return `https://everyayah.com/data/Alafasy_64kbps/${chapterStr}${verseStr}.mp3`;
}

export function formatChapterAudioLink(chapter: number): string {
  const chapterStr = chapter.toString().padStart(3, '0');

  return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${chapterStr}.mp3`;
}
