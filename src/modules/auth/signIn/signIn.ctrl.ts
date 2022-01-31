import type { FastifyTypedInstance } from '../../..//openapi';
import type { UserRepository } from '../../../db/repositories/User.repository';
import type { InternalKeysStorage } from '../../keysStorage/internalKeysStorage';
import { generateAccessToken } from '../tokens.usecase';

import { validateCredentials } from './signIn.usecase';

const signInSchema = {
  description: 'Sign into account',
  summary: 'Sign in',
  tags: ['Auth'],
  body: {
    type: 'object',
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
    required: ['email', 'password'],
  },
  response: {
    201: {
      description: 'Created session token available in response',
      type: 'object',
      properties: {
        authToken: { type: 'string' },
      },
      required: ['authToken'],
    },
    401: {
      description: 'Account does not exist or incorrect values passed',
      type: 'object',
      properties: {
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              detail: {
                type: 'string',
                enum: ['Account does not exist or incorrect values passed'],
              },
            },
            required: ['title'],
            additionalProperties: false,
          },
        },
      },
      required: ['errors'],
      additionalProperties: false,
    },
  },
} as const;

export const registerSignInController =
  (app: FastifyTypedInstance) =>
  ({
    userRepository,
    keysStorage,
  }: {
    userRepository: UserRepository;
    keysStorage: InternalKeysStorage;
  }) => {
    app.typedRoute({
      method: 'POST',
      url: '/api/sign-in',
      schema: signInSchema,
      handler: async (req, reply) => {
        const { email: inputEmail, password } = req.body;

        const validationResult = await validateCredentials({
          userRepository,
          logger: req.log,
        })({ email: inputEmail, password });

        if (!validationResult) {
          reply.status(401).send({
            errors: [
              {
                title: 'Invalid credentials',
                detail: 'Account does not exist or incorrect values passed',
              },
            ],
          });
          return;
        }

        const { email } = validationResult;
        const authToken = await generateAccessToken({ keysStorage })({
          email,
          password,
        });

        reply.status(201).send({ authToken });
      },
    });
  };
