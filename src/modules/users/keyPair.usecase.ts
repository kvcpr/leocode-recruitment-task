import type { FastifyLoggerInstance } from 'fastify';

import type { InternalKeysStorage } from '@/modules/keysStorage/internalKeysStorage';

export const getKeyPairForEmail =
  ({
    keysStorage,
    log,
  }: {
    keysStorage: InternalKeysStorage;
    log: FastifyLoggerInstance;
  }) =>
  ({ email }: { email: string }) => {
    const privKey = keysStorage.getPrivateKey(email)?.value;
    const pubKey = keysStorage.getPublicKey(email)?.value;

    if (!privKey || !pubKey) {
      log.fatal('Missing rsa key pair for user', { user: { email } });
      throw new Error('Missing key pair for user');
    }

    return { privKey, pubKey };
  };
