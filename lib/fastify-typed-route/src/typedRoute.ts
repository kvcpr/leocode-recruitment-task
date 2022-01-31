import type { JTDDataType } from 'ajv/dist/jtd';
import type {
  FastifyReply,
  FastifyRequest,
  FastifySchema,
  RouteOptions,
  FastifyInstance,
  FastifyPluginCallback,
} from 'fastify';
import fp from 'fastify-plugin';
import type { OpenAPIV3 } from 'openapi-types';

export type SchemaDefinitions = Record<string, OpenAPIV3.SchemaObject>;

export function createFastifyTypedRoute(schemas: SchemaDefinitions) {
  return {
    fastifyTypedRoute: fp(fastifyTypedRoute(schemas)),
  };
}

function fastifyTypedRoute(schema: SchemaDefinitions): FastifyPluginCallback {
  return (app, _opts, done) => {
    for (const [key, value] of Object.entries<OpenAPIV3.SchemaObject>(schema)) {
      app.addSchema({
        $id: `#/components/schemas/${key}`,
        ...value,
      });
    }

    app.decorate(
      'typedRoute',
      function (this: FastifyInstance, options: RouteOptions) {
        this.route(options);
      }
    );

    done();
  };
}

export type TypedRequestSchema<Schema extends FastifySchema = FastifySchema> = {
  Body: JTDDataType<Schema['body']>;
  Params: JTDDataType<Schema['params']>;
  Headers: JTDDataType<Schema['headers']>;
  Querystring: JTDDataType<Schema['querystring']>;
  Reply: {
    [StatusCode in keyof Schema['response']]: JTDDataType<
      Schema['response'][StatusCode]
    >;
  };
};

type TypedFastifyReply<
  RouteSchema extends TypedRequestSchema,
  StatusCode extends keyof RouteSchema['Reply'] = never
> = Omit<FastifyReply, 'status' | 'send'> & {
  status<K extends keyof RouteSchema['Reply']>(
    statusCode: K
  ): TypedFastifyReply<RouteSchema, K>;
  send: keyof RouteSchema['Reply'][StatusCode] extends never
    ? () => TypedFastifyReply<RouteSchema, StatusCode>
    : (
        data: RouteSchema['Reply'][StatusCode]
      ) => TypedFastifyReply<RouteSchema, StatusCode>;
};

type TypedHandlerCallback<T extends TypedRequestSchema> = (
  req: FastifyRequest<T>,
  res: TypedFastifyReply<T>
) => Promise<void>;

export type TypedFastify = FastifyInstance;

declare module 'fastify' {
  interface FastifyInstance {
    typedRoute<RouteSchema>(
      opts: TypedRouteOptions<RouteSchema>
    ): FastifyInstance;
  }

  export interface TypedRouteOptions<RouteSchema extends FastifySchema>
    extends Omit<RouteOptions, 'schema' | 'handler' | 'preHandler'> {
    schema: RouteSchema;
    handler: TypedHandlerCallback<TypedRequestSchema<RouteSchema>>;
    preHandler?: TypedHandlerCallback<TypedRequestSchema<RouteSchema>>[];
  }
}
