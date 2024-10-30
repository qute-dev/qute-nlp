"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    DEBUG: process.env.DEBUG === 'false',
    HOST: process.env.HOST || '127.0.0.1',
    PORT: process.env.PORT || 7777,
    MEILI_ADDRESS: process.env.MEILI_ADDRESS || 'http://127.0.0.1:7700',
    MEILI_KEY: process.env.MEILI_KEY || 'xck1bMOeroIaAKS_P0giqoVKxwUGsZ_iHM7qgd32EK4',
};
exports.default = exports.env;
