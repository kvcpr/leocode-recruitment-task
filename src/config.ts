import { config as dotenv } from 'dotenv';
import { cleanEnv, str, port, host, bool } from 'envalid';

dotenv();

const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),

  PORT: port(),
  HOST: host(),

  SHOW_SWAGGER_ROUTE: bool({ default: false }),
});

export default env;
