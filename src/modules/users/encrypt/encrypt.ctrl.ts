import type { InternalKeysStorage } from '@/modules/keysStorage/internalKeysStorage';
import { authorizedRouteSecurity, FastifyTypedInstance } from '@/openapi';

import { getKeyPairForEmail } from '../keyPair.usecase';

import { encryptFileWithPublicKey } from './encrypt.usecase';

const encryptSchema = {
  description:
    'Returns file contains base64 string encoded with user rsa public key',
  ...authorizedRouteSecurity,
  tags: ['User'],
  response: {
    201: {
      description: 'User key pair',
      type: 'string',
      produces: ['application/octet-steam'],
    },
  },
} as const;

export const registerEncryptController =
  (app: FastifyTypedInstance) =>
  ({ keysStorage }: { keysStorage: InternalKeysStorage }) => {
    app.typedRoute({
      method: 'GET',
      url: '/api/encrypt',
      schema: encryptSchema,
      handler: async (req, reply) => {
        const email = req.authorizedUserEmail;
        const { pubKey: publicKey } = getKeyPairForEmail({
          keysStorage,
          log: req.log,
        })({ email });
        const encryptedString = await encryptFileWithPublicKey()({ publicKey });

        reply.status(201).type('application/octet-steam').send(encryptedString);
      },
    });
  };
