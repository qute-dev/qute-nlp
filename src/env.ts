export const env = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  DEBUG: process.env.DEBUG === 'false',
  MEILI_ADDRESS: process.env.MEILI_ADDRESS || 'http://127.0.0.1:7700',
  MEILI_KEY:
    process.env.MEILI_KEY || 'xck1bMOeroIaAKS_P0giqoVKxwUGsZ_iHM7qgd32EK4',
};

export default env;
