import type { FastifyInstance } from 'fastify';

import { generateAccessToken } from '@/modules/auth/tokens.usecase';
import { setupTestApp, SetupTestAppResult } from '@/spec/setupTestApp';

import { getKeyPairForEmail } from '../keyPair.usecase';

import { decryptFileWithPrivateKey } from './encrypt.usecase';

describe('GET /api/encrypt', () => {
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
    await request.post('/api/encrypt').expect(401);
  });

  it('should return encrypted text', async () => {
    const response = await request
      .post('/api/encrypt')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(201)
      .expect('Content-Type', 'application/octet-steam');

    expect(response.text).toBeDefined();
  });

  it('should be able to decrypt response with user private key', async () => {
    const response = await request
      .post('/api/encrypt')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(201)
      .expect('Content-Type', 'application/octet-steam');

    const encodedString = response.text;

    const { privKey: privateKey } = getKeyPairForEmail({
      keysStorage,
      log: app.log,
    })({
      email,
    });

    const decrypted = decryptFileWithPrivateKey()({
      privateKey,
      passphrase: password,
      encodedString,
    });

    expect(decrypted).toBeInstanceOf(Buffer);
    expect(decrypted.toString()).toContain('PDF-1.3');
  });
});
