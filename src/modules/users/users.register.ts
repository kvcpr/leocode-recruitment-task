import type { FastifyInstance, onRequestAsyncHookHandler } from 'fastify';

import type { InternalKeysStorage } from '../keysStorage/internalKeysStorage';

import { registerEncryptController } from './encrypt/encrypt.ctrl';
import { registerGenerateKeyPairController } from './generateKeyPair/generateKeyPair.ctrl';

interface RegisterDeps {
  authorizeHook: onRequestAsyncHookHandler;
  keysStorage: InternalKeysStorage;
}

export const registerUsersHandlers =
  (app: FastifyInstance) =>
  ({ authorizeHook, keysStorage }: RegisterDeps) => {
    app.register((app, _, done) => {
      app.addHook('onRequest', authorizeHook);

      registerGenerateKeyPairController(app)({ keysStorage });
      registerEncryptController(app)({ keysStorage });

      done();
    });
  };
