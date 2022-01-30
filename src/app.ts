import { createFastifyTypedRoute } from '@hypedevs/fastify-typed-route';
import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

import { registerRouteHanlder } from '@/modules/index.register';
import { registerSwagger, schemaDefinitions } from '@/openapi';

export async function setupApp(): Promise<FastifyInstance> {
  const baseApp = fastify({});

  const app = await registerGlobalPlugins(baseApp);

  registerRouteHanlder(app)();

  return app;
}

async function registerGlobalPlugins(
  app: FastifyInstance
): Promise<FastifyInstance> {
  const { fastifyTypedRoute } = createFastifyTypedRoute(schemaDefinitions);
  await app.register(fastifyTypedRoute);

  await registerSwagger(app);

  return app;
}
