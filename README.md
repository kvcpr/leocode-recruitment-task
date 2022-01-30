# Leocode Recruitment Task

## What's bundled

### TypeScript

Entire project is written using TypeScript 4. No JS files should be necessary.

### ESLint / Prettier

[Eslint](https://eslint.org) and [Prettier](https://prettier.io) are configured in the project using predefinied [@hypedevs/eslint-config](https://github.com/hypedevs/eslint-config) library. You can adjust them to your liking by modifying the `eslint` section in `package.json`.

### Fastify

[Fastify](https://fastify.io) is the core framework used for HTTP in this project.

### JSON Schema / Open API / JSON API

As Fastify [supports JSON Schema out of the box](https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/) each request is described in as much detail as possible. Check out `*.ctrl.ts` files to see how to endpoint are provided with dedicated OpenAPI definition.

After any change in routes JSON Schema definition with api started up, the [./openapi.json](./openapi.json) file will be reconstructed, transforming and combining JSON Schemas from controllers into a single JSON. It's commited to the repo and serve as reference for current API interface.

#### Swagger
Server provide [swagger](https://swagger.io/) panel for documentation browsing: http://localhost:3000/documentation

#### FastifyTypedRoute
A util library that allows type inference from JSON Schemas directly into route handler is present in this project. I built this library some time ago but didn't publish it yet cause it miss tests - the plan is to make it public when I have time - currently it's available in the [lib/fastify-typed-route](./lib/fastifty-typed-route) directory with the whole git log because it was cloned as submodule from the original repo to lib dir.