import type { FastifyInstance } from 'fastify';

import {
  RegisterAuthDependencies,
  registerAuthHandlers,
} from './auth/auth.register';
import { authorizeRequestHook } from './auth/authorizeRequestHook';
import { registerInfrastructureHandlers } from './infrastructure/infrastructure.register';
import { registerUsersHandlers } from './users/users.register';

export type RegisterDependencies = RegisterAuthDependencies;

export const registerRouteHanlder =
  (app: FastifyInstance) =>
  ({ userRepository, keysStorage }: RegisterDependencies) => {
    registerInfrastructureHandlers(app)();
    registerAuthHandlers(app)({ userRepository, keysStorage });

    const authorizeHook = authorizeRequestHook({ keysStorage });

    registerUsersHandlers(app)({ authorizeHook });
  };
