declare module '@nlpjs/basic' {
  type DockStart = {
    get(module: string): any;
  };

  type Nlp = {
    use: string[];
    addLanguage(lang: string): void;
    addDocument(lang: string, utterance: string, intent: string): void;
    addAnswer(lang: string, intent: string, answer: string): void;
    train(): Promise<void>;
    loadOrTrain(): Promise<void>;
    process(lang: string, text: string): any;
  };

  async function dockStart(config: object): Promise<DockStart>;
}

declare module '@nlpjs/lang-id' {
  class StopwordsId {}

  class StemmerId {
    abstract tokenizeAndStem(input: string, arg1?: boolean): any;
    stopwords: StopwordsId;
  }
}
