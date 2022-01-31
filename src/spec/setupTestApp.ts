import type { FastifyInstance } from 'fastify';
import supertest from 'supertest';

import { setupApp } from '@/app';
import type { AppDeps } from '@/app';
import { UserRepository } from '@/db/repositories/User.repository';
import { InternalKeysStorage } from '@/modules/keysStorage/internalKeysStorage';

export type SetupTestAppResult = AppDeps & {
  app: FastifyInstance;
  request: supertest.SuperTest<supertest.Test>;
};

export const setupTestApp = async (
  args: Partial<AppDeps>
): Promise<SetupTestAppResult> => {
  const keysStorage = new InternalKeysStorage();
  const userRepository = new UserRepository(keysStorage);

  const deps = {
    keysStorage,
    userRepository,
    ...args,
  };

  const app = await setupApp(deps);

  const request = supertest(app.server);

  return { ...deps, app, request };
};
