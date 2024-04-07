import { pino } from 'pino';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: `pid,hostname,name`,
      hideObject: process.env.DEBUG !== 'true',
    },
  },
  level: process.env.DEBUG === 'true' ? 'debug' : 'info',
});

export const log = (text: string, obj?: any, ...args: any[]) =>
  logger.info(obj, text, args);

export const info = log;

export const debug = (text: string, obj?: any, ...args: any[]) =>
  logger.debug(obj, text, args);

export const error = (text: string, obj?: any, ...args: any[]) =>
  logger.error(obj, text, args);
