import type { FastifyInstance } from 'fastify';

import { registerVersionController } from './version/version.ctrl';

export const registerInfrastructureHandlers = (app: FastifyInstance) => () => {
  registerVersionController(app)();
};
