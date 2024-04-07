export const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  DEBUG: process.env.DEBUG === 'false',
  HOST: process.env.HOST || '127.0.0.1',
  PORT: process.env.PORT || 7777,
};

export default env;
