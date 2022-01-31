import type { FastifyInstance } from 'fastify';

import { generateAccessToken } from '@/modules/auth/tokens.usecase';
import { setupTestApp, SetupTestAppResult } from '@/spec/setupTestApp';

import { getKeyPairForEmail } from '../keyPair.usecase';

describe('GET /api/generate-key-pair', () => {
  let app: FastifyInstance;
  let request: SetupTestAppResult['request'];
  let accessToken: string;
  let keysStorage: SetupTestAppResult['keysStorage'];

  const email = 'email@example.com';
  const password = 'pass321';

  beforeAll(async () => {
    let userRepository: SetupTestAppResult['userRepository'];

    ({ app, request, userRepository, keysStorage } = await setupTestApp({}));
    await app.ready();

    await userRepository.create({ email, password });
    accessToken = await generateAccessToken({ keysStorage })({
      email,
      password,
    });
  });

  it('should require authentication', async () => {
    await request.post('/api/generate-key-pair').expect(401);
  });

  it('should returns key pair associated to user', async () => {
    const response = await request
      .post('/api/generate-key-pair')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200);

    expect(response.body).toHaveProperty('privKey');
    expect(response.body).toHaveProperty('pubKey');

    const { privKey, pubKey } = getKeyPairForEmail({
      keysStorage,
      log: app.log,
    })({
      email,
    });

    expect(response.body.privKey).toEqual(privKey);
    expect(response.body.pubKey).toEqual(pubKey);
  });
});
