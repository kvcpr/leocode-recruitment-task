import type { FastifyInstance, onRequestAsyncHookHandler } from 'fastify';

interface RegisterDeps {
  authorizeHook: onRequestAsyncHookHandler;
}

export const registerUsersHandlers =
  (app: FastifyInstance) =>
  ({ authorizeHook }: RegisterDeps) => {
    app.register((app, _, done) => {
      app.addHook('onRequest', authorizeHook);

      done();
    });
  };
