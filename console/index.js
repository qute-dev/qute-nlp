const { dockStart } = require('@nlpjs/basic');

async function setupTraining(nlp) {
    nlp.addLanguage('id');
    nlp.addDocument('id', 'halo', 'greeting');
    nlp.addAnswer('id', 'greeting', 'Halo juga apa kabar');
}

(async () => {
    const dock = await dockStart();
    const nlp = dock.get('nlp');

    await setupTraining(nlp);

    await nlp.loadOrTrain();
})();
