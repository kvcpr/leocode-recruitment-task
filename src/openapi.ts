import fs from 'fs';

import type {
  SchemaDefinitions,
  TypedFastify,
} from '@hypedevs/fastify-typed-route';
import fastifySwagger from 'fastify-swagger';
import type { OpenAPIV3 } from 'openapi-types';

import config from '@/config';

export const schemaDefinitions: SchemaDefinitions = {};

export type FastifyTypedInstance = TypedFastify;

export function buildOpenApiSchema(app: FastifyTypedInstance) {
  const openApiSchema = app.swagger() as OpenAPIV3.Document;

  openApiSchema.paths = {
    ...Object.fromEntries(
      Object.entries(openApiSchema.paths).filter(([path]) => path !== '*')
    ),
  };

  return openApiSchema;
}

export function saveOpenApiSchema(app: FastifyTypedInstance) {
  const openApiSchema = buildOpenApiSchema(app);
  fs.writeFileSync('./openapi.json', JSON.stringify(openApiSchema, null, 2));
}

export async function registerSwagger(app: FastifyTypedInstance) {
  const bearerAuth: OpenAPIV3.HttpSecurityScheme = {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Access token stored in "Authorization" header',
  };

  await app.register(fastifySwagger, {
    exposeRoute: config.SHOW_SWAGGER_ROUTE,
    openapi: {
      info: {
        title: 'Leocode Recuruitment Task API',
        version: '1.0',
      },
      components: {
        schemas: schemaDefinitions,
        securitySchemes: {
          bearerAuth,
        },
      },
    },
  });
}
