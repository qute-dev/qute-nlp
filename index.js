const { dockStart } = require('@nlpjs/basic');

async function setupTraining(nlp) {
    nlp.addLanguage('id');
    nlp.addDocument('id', 'halo', 'greeting');
    nlp.addAnswer('id', 'greeting', 'Halo juga apa kabar');

    // await nlp.addCorpus({ filename: './qna.tsv', importer: 'qna', locale: 'en' });
}

(async () => {
    const dock = await dockStart();
    const nlp = dock.get('nlp');

    await setupTraining(nlp);

    await nlp.loadOrTrain();

    // const response = await nlp.process('en', 'Who are you');
})();
