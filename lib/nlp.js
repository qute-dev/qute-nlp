"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.train = exports.process = exports.initNlp = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const basic_1 = require("@nlpjs/basic");
const logger_1 = require("./logger");
let nlp;
async function initNlp() {
    (0, logger_1.log)(`[nlp] Initializing NLP...`);
    const config = await getConfig();
    const dock = await (0, basic_1.dockStart)(config);
    nlp = dock.get('nlp');
    (0, logger_1.log)('[nlp] Load or train NLP...');
    await nlp.loadOrTrain();
}
exports.initNlp = initNlp;
async function process(text) {
    return (await nlp.process('id', text));
}
exports.process = process;
async function train() {
    (0, logger_1.log)('[nlp] Training NLP...');
    await nlp.train();
}
exports.train = train;
async function getConfig() {
    const corpusDir = path_1.default.join(__dirname, '..', 'corpus');
    const modelDir = path_1.default.join(__dirname, '..', 'lib');
    (0, logger_1.log)(`[nlp] Corpus: ${corpusDir}`);
    await fs_extra_1.default.ensureDir(corpusDir);
    return {
        settings: {
            nlp: {
                threshold: 0.9,
                autoLoad: true,
                autoSave: true,
                modelFileName: path_1.default.join(modelDir, 'model.nlp'),
                corpora: [
                    path_1.default.join(corpusDir, 'greeting.json'),
                    path_1.default.join(corpusDir, 'quran-id.json'),
                ],
            },
        },
        use: ['Basic', 'LangId'],
    };
}
