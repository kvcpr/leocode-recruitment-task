import type { FastifyTypedInstance } from '@/openapi';

import { version } from '@/../package.json';

const versionSchema = {
  description: 'Application version',
  tags: ['Infrastructure'],
  response: {
    200: {
      description: 'Application version',
      type: 'object',
      properties: {
        version: { type: 'string' },
      },
      required: ['version'],
    },
  },
} as const;

export const registerVersionController = (app: FastifyTypedInstance) => () => {
  app.typedRoute({
    method: 'GET',
    url: '/version',
    logLevel: 'warn',
    schema: versionSchema,
    handler: async (req, reply) => {
      reply.status(200).send({ version });
    },
  });
};
