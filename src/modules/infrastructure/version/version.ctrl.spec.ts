import type { FastifyInstance } from 'fastify';

import { setupTestApp, SetupTestAppResult } from '@/spec/setupTestApp';

import { version } from '@/../package.json';

describe('GET /version', () => {
  let app: FastifyInstance;
  let request: SetupTestAppResult['request'];

  beforeAll(async () => {
    ({ app, request } = await setupTestApp({}));
    await app.ready();
  });

  it('should return version from package.json', async () => {
    const response = await request.get('/version').expect(200);

    expect(response.body).toHaveProperty('version');
    expect(response.body.version).toEqual(version);
  });
});
