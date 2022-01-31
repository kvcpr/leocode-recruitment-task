import type {
  FastifyInstance,
  FastifyRequest,
  onRequestAsyncHookHandler,
} from 'fastify';

import { authorizedRoute } from '@/openapi';

import type { InternalKeysStorage } from '../keysStorage/internalKeysStorage';

import * as tokensUseCase from './tokens.usecase';

const userEmailDecoratorName = 'authorizedUserEmail';

declare module 'fastify' {
  interface FastifyRequest {
    [userEmailDecoratorName]: string;
  }
}

export function authorizeRequestHook({
  keysStorage,
}: {
  keysStorage: InternalKeysStorage;
}): onRequestAsyncHookHandler {
  return async (req, reply) => {
    try {
      const reqAccessToken = tokensUseCase.extractBearerToken(
        req.headers.authorization ?? ''
      );

      if (!reqAccessToken) {
        req.log.debug('Authorization token not found');
        return reply.status(401).send(unauthorizedResponseBody());
      }

      const { email } = await tokensUseCase.verifyAccessToken({
        keysStorage,
      })({ accessToken: reqAccessToken });
      req[userEmailDecoratorName] = email;
    } catch (err) {
      req.log.debug(err, 'Request authorization failed');
      return reply.status(401).send(unauthorizedResponseBody());
    }
  };
}

const unauthorizedResponseSchema = authorizedRoute.unauthorizedResponse();

function unauthorizedResponseBody() {
  return {
    errors: [
      {
        title: 'Unauthorized',
        detail: unauthorizedResponseSchema[401].description,
      },
    ],
  };
}

export function decorateFastifyWithUserEmail(app: FastifyInstance) {
  return app.decorateRequest(
    userEmailDecoratorName,
    userEmailDecoratorFactory()
  );
}

function userEmailDecoratorFactory() {
  let email: string | null = null;
  // clearly inform developer if he forgot to protect an endpoint
  return {
    setter: (_email: string) => (email = _email),
    getter: function (this: FastifyRequest) {
      if (email === null) {
        throw new Error(
          'Implementation error: Authorization details has not been provided. ' +
            'Did you register the authorization hook ' +
            `for '${this.method} ${this.url}' endpoint?`
        );
      }

      return email;
    },
  };
}
