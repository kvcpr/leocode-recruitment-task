import type { FastifyInstance } from 'fastify';

import type { UserRepository } from '@/db/repositories/User.repository';
import { setupTestApp, SetupTestAppResult } from '@/spec/setupTestApp';

describe('POST /api/sign-in', () => {
  let app: FastifyInstance;
  let userRepository: UserRepository;
  let request: SetupTestAppResult['request'];

  beforeAll(async () => {
    ({ app, userRepository, request } = await setupTestApp({}));
    await app.ready();
  });

  it('should reply with 401 if account does not exists', async () => {
    const response = await request
      .post('/api/sign-in')
      .send({ email: 'email@example.com', password: 'password' })
      .expect(401);

    expect(response.body).toEqual({
      errors: [
        {
          detail: 'Account does not exist or incorrect values passed',
          title: 'Invalid credentials',
        },
      ],
    });
  });

  it('should reply with 401 if account does exist, but password is invalid', async () => {
    const email = 'email@example.com';
    const password = 'pass321';
    await userRepository.create({ email, password });

    const response = await request
      .post('/api/sign-in')
      .send({ email, password: 'password' })
      .expect(401);

    expect(response.body).toEqual({
      errors: [
        {
          detail: 'Account does not exist or incorrect values passed',
          title: 'Invalid credentials',
        },
      ],
    });
  });

  describe('when password is valid', () => {
    it('should reply with 201 with tokens if no "referer" header has been sent', async () => {
      const email = 'email2@example.com';
      const password = 'pass321';
      await userRepository.create({ email, password });

      const response = await request
        .post('/api/sign-in')
        .send({ email, password })
        .expect(201);

      expect(response.body).toHaveProperty('authToken');
    });
  });
});
