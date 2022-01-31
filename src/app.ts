import { createFastifyTypedRoute } from '@hypedevs/fastify-typed-route';
import fastify from 'fastify';
import type { FastifyInstance } from 'fastify';

import config from './config';
import { decorateFastifyWithUserEmail } from './modules/auth/authorizeRequestHook';
import {
  RegisterDependencies,
  registerRouteHanlder,
} from './modules/index.register';
import { registerSwagger, schemaDefinitions } from './openapi';

export type AppDeps = RegisterDependencies;

export async function setupApp(
  deps: RegisterDependencies
): Promise<FastifyInstance> {
  const baseApp = fastify({
    logger: config.ENABLE_LOGGING
      ? {
          level: config.LOG_LEVEL,
          prettyPrint: config.PRETTY_PRINT,
        }
      : false,
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
