import fs from 'fs';

import type { FastifyInstance } from 'fastify';

import { buildOpenApiSchema, saveOpenApiSchema } from './openapi';
import { setupTestApp } from './spec/setupTestApp';

import currentOpenApi from '../openapi.json';

describe('openapi.json', () => {
  const fsWriteFileSyncSpy = jest.spyOn(fs, 'writeFileSync');

  let app: FastifyInstance;

  beforeAll(async () => {
    ({ app } = await setupTestApp({}));
  });

  it('should be up to date with schemas defined in controller files', () => {
    // We cannot match json and created schema cause of symbols so we will get rid of them using JSON
    const removeSymbols = (input: any) => JSON.parse(JSON.stringify(input));

    const upToDateOpenApi = removeSymbols(buildOpenApiSchema(app));

    try {
      expect(currentOpenApi).toEqual(upToDateOpenApi);
    } catch (err) {
      throw new Error(
        'Generated OpenAPI schema in openapi.json does not match the current state of schemas in controller files. Start up the app to automatically get it up to date.'
      );
    }
  });

  it('should save new schema to openapi.json', () => {
    saveOpenApiSchema(app);

    expect(fs.writeFileSync).toBeCalledTimes(1);
    expect(fs.writeFileSync).toBeCalledWith(
      './openapi.json',
      JSON.stringify(buildOpenApiSchema(app), null, 2)
    );
    fsWriteFileSyncSpy.mockClear();
  });
});
