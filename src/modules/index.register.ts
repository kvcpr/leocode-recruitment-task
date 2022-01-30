import type { FastifyInstance } from 'fastify';

import { registerInfrastructureHandlers } from './infrastructure/infrastructure.register';

export const registerRouteHanlder = (app: FastifyInstance) => () => {
  registerInfrastructureHandlers(app)();
};
