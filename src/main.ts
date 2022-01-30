import 'reflect-metadata';
import config from '@/config';

import { setupApp } from './app';
import { saveOpenApiSchema } from './openapi';

async function main() {
  try {
    const app = await setupApp();

    if (config.isDevelopment) {
      saveOpenApiSchema(app);
    }

    await app.listen(config.PORT, config.HOST);
  } catch (err) {
    console.error({ err });
    process.exit(1);
  }
}

main();
