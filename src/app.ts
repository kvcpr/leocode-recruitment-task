import { createFastifyTypedRoute } from '@hypedevs/fastify-typed-route';
import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

import {
  RegisterDependencies,
  registerRouteHanlder,
} from '@/modules/index.register';
import { registerSwagger, schemaDefinitions } from '@/openapi';

import { decorateFastifyWithUserEmail } from './modules/auth/authorizeRequestHook';

export type AppDeps = RegisterDependencies;

export async function setupApp(
  deps: RegisterDependencies
): Promise<FastifyInstance> {
  const baseApp = fastify({
    logger: false,
  });

  const app = await registerGlobalPlugins(baseApp);

  registerRouteHanlder(app)(deps);

  return app;
}

async function registerGlobalPlugins(
  app: FastifyInstance
): Promise<FastifyInstance> {
  const { fastifyTypedRoute } = createFastifyTypedRoute(schemaDefinitions);
  await app.register(fastifyTypedRoute);

  decorateFastifyWithUserEmail(app);

  await registerSwagger(app);

  return app;
}
