import 'reflect-metadata';
import config from '@/config';

import { setupApp } from './app';
import { UserRepository } from './db/repositories/user.repository';
import { InternalKeysStorage } from './modules/keysStorage/internalKeysStorage';
import { saveOpenApiSchema } from './openapi';

async function seedData(userRepository: UserRepository) {
  await Promise.all([
    userRepository.create({ email: 'user1@app.dev', password: 'S0m3P@ssw0rd' }),
    userRepository.create({
      email: 'user2@app.dev',
      password: 'S0m3P@ssw0rd2',
    }),
  ]);
}

async function main() {
  try {
    const keysStorage = new InternalKeysStorage();
    const userRepository = new UserRepository(keysStorage);

    await seedData(userRepository);

    const app = await setupApp({ keysStorage, userRepository });

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
