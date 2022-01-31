import argon2 from 'argon2';
import type { FastifyLoggerInstance } from 'fastify';

import type { UserRepository } from '@/db/repositories/User.repository';

export const validateCredentials =
  ({
    userRepository,
    logger,
  }: {
    userRepository: UserRepository;
    logger: FastifyLoggerInstance;
  }) =>
  async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ email: string } | null> => {
    const user = userRepository.findByEmail({ email });

    if (!user) {
      logger.warn(
        { email },
        'validateCredentials: Someone tried to sing in with non existing user email'
      );
      return null;
    }

    const passwordValid = await isPasswordValid({ logger })({
      password,
      passwordHash: user.passwordHash,
    });

    return passwordValid ? { email: user.email } : null;
  };

export const isPasswordValid =
  ({ logger }: { logger: FastifyLoggerInstance }) =>
  async ({
    passwordHash,
    password,
  }: {
    passwordHash: string;
    password: string;
  }) => {
    try {
      const passwordMatch = await argon2.verify(passwordHash, password);

      if (!passwordMatch) {
        logger.trace('isPasswordValid: Passwords did not match');
        return false;
      }

      return true;
    } catch (err) {
      logger.error({ err }, 'isPasswordValid: argon2 error');
      return false;
    }
  };
