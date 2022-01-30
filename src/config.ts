import { config as dotenv } from 'dotenv';
import { cleanEnv, str, port, host, bool, num } from 'envalid';

dotenv();

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),

  PORT: port(),
  HOST: host(),

  SHOW_SWAGGER_ROUTE: bool({ default: false }),

  AUTH_ACCESS_TOKEN_TTL_SECS: num(),
  AUTH_ISSUER: str(),
});

export default env;
