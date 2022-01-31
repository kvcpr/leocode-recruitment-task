import type { InternalKeysStorage } from '@/modules/keysStorage/internalKeysStorage';
import { authorizedRouteSecurity, FastifyTypedInstance } from '@/openapi';

import { getKeyPairForEmail } from '../keyPair.usecase';

const generateKeyPairSchema = {
  description: 'Returns user key pair',
  ...authorizedRouteSecurity,
  tags: ['User'],
  response: {
    200: {
      description: 'User key pair',
      type: 'object',
      properties: {
        privKey: { type: 'string' },
        pubKey: { type: 'string' },
      },
      required: ['privKey', 'pubKey'],
    },
  },
} as const;

export const registerGenerateKeyPairController =
  (app: FastifyTypedInstance) =>
  ({ keysStorage }: { keysStorage: InternalKeysStorage }) => {
    app.typedRoute({
      method: 'GET',
      url: '/api/generate-key-pair',
      schema: generateKeyPairSchema,
      handler: async (req, reply) => {
        const email = req.authorizedUserEmail;
        const keyPair = getKeyPairForEmail({ keysStorage, log: req.log })({
          email,
        });

        reply.status(200).send(keyPair);
      },
    });
  };
