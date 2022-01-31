import type { FastifyLoggerInstance } from 'fastify';
import { mockDeep } from 'jest-mock-extended';

import type { InternalKeysStorage } from '../keysStorage/internalKeysStorage';

import { getKeyPairForEmail } from './keyPair.usecase';

describe('getKeyPairForEmail', () => {
  it('throws when there is missing key pair for email', () => {
    const keysStorage = mockDeep<InternalKeysStorage>();
    const log = mockDeep<FastifyLoggerInstance>();
    const email = 'someemail@email.local';

    expect.assertions(2);

    try {
      getKeyPairForEmail({ log, keysStorage })({ email });
    } catch (err) {
      expect(err).toHaveProperty('message');
      expect((err as Error).message).toEqual('Missing key pair for user');
    }
  });
});
