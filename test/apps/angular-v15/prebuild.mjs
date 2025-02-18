import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
// eslint-disable-next-line node/no-unpublished-import
import '../../../env.cjs'; // set environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getContent = (env, isProd) => {
  return `
  export const environment = {
    production: '${isProd}',
    appBaseHref: '/',
    oidc: {
      clientId: '${env.CLIENT_ID}',
      issuer: '${env.ISSUER}',
      redirectUri: '/login/callback',
      scopes: ['openid', 'profile', 'email', 'groups'],
      pkce: true,
    },
    resourceServer: {
      messagesUrl: 'http://localhost:8000/api/messages',
    },
    asyncninjaConfig: ${env.ASYNC_ninja_CONFIG === '1'},
  };
  `;
};

const getFilePath = isProd => 
  path.resolve(
    __dirname, 
    'src', 
    'environments', 
    isProd ? 'environment.prod.ts' : 'environment.ts'
  );

const env = {};
// List of environment variables made available to the app
[
  'ISSUER',
  'CLIENT_ID',
].forEach(function (key) {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = process.env[key];
});
env['ASYNC_ninja_CONFIG'] = process.env['ASYNC_ninja_CONFIG'];

fs.writeFileSync(getFilePath(false), getContent(env, false));
fs.writeFileSync(getFilePath(true), getContent(env, true));
