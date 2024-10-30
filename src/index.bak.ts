import 'dotenv/config';

import * as Koa from 'koa';
import * as bodyParser from 'koa-bodyparser';
import * as json from 'koa-json';
import cors from '@koa/cors';

import { info, logger } from './logger';
import { router } from './router';
import { initNlp } from './nlp';
import { env } from './env';

const { NODE_ENV, DEBUG, HOST, PORT } = env;

async function start() {
  info('[APP] Starting NLP API server...', { NODE_ENV, DEBUG });
  await initNlp();

  const app = new Koa.default();
  app.use(json.default());
  app.use(bodyParser.default());
  app.use(cors());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.listen(Number(PORT), HOST as string);

  info(`[APP] Server listening http://${HOST}:${PORT}`);
}

start();
