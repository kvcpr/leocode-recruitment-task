import type { UserRepository } from '../../db/repositories/User.repository';
import type { FastifyTypedInstance } from '../../openapi';
import type { InternalKeysStorage } from '../keysStorage/internalKeysStorage';

import { registerSignInController } from './signIn/signIn.ctrl';

export interface RegisterAuthDependencies {
  keysStorage: InternalKeysStorage;
  userRepository: UserRepository;
}

export const registerAuthHandlers =
  (app: FastifyTypedInstance) =>
  ({ userRepository, keysStorage }: RegisterAuthDependencies) => {
    registerSignInController(app)({ userRepository, keysStorage });
  };
