import * as Router from 'koa-router';

import { debug, info } from './logger';
import { getAnswer, getCache } from './bot';
import { process } from './nlp';

export const router = new Router.default();

router.get('/', async (ctx, next) => {
  info('[GET] /');

  ctx.body = 'OK';

  await next();
});

router.get('/cache', async (ctx, next) => {
  info('[GET] /cache');

  ctx.body = getCache();

  await next();
});

router.post('/query', async (ctx, next) => {
  const { user, platform, text } = ctx.request.body as any;

  info('[POST] /query', { user, platform });

  const resp = await process(text);
  const result = await getAnswer(resp, user, platform);

  debug('[POST] /query:result', result);

  ctx.body = result;

  await next();
});
