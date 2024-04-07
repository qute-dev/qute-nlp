import * as Router from 'koa-router';

import { debug, info } from './logger';
import { getAnswer } from './bot';
import { process } from './nlp';

export const router = new Router.default();

router.get('/', async (ctx, next) => {
  info('[GET] /');

  ctx.body = 'OK';

  await next();
});

router.post('/query', async (ctx, next) => {
  const { user, text } = ctx.request.body as any;

  info('[POST] /query', { user });

  const resp = await process(text);
  const result = await getAnswer(resp);

  debug('[POST] /query:result', result);

  ctx.body = result;

  await next();
});
