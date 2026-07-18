# How To Create APIs

APIs are the main way external systems and clients interact with a Nodics application.

An API has a clear owner, route definition, permission rule, request contract, response contract, and test coverage.

## Start With The Use Case

Before creating a route, define:

- Who calls this API?
- What action are they performing?
- What data is required?
- What data is returned?
- Which permission is required?
- Is the caller a human user, service account, internal module, or external system?
- Does the route work before login, after login, or only for service-to-service communication?
- Is this route a sensitive runtime, diagnostic, file, import/export, test,
  dynamic class, or maintenance API that needs an `apiExposure` category?
- Does the owning server/node require HTTP hardening changes such as CORS
  origins, body limits, proxy trust, or rate limits?

## Route Ownership

Routes belong to the module that owns the capability.

Do not put unrelated APIs into a central controller just because it is easy to find. Keep each route close to the schema, service, controller, tests, and documentation for the capability it exposes.

## Route Definitions

Define API routes in the owning module's route registry. Current generated modules use `src/router/routers.js` for route definitions and `src/router/appConfig.js` for application router configuration.

A route definition makes these decisions visible:

- HTTP method.
- URL and context root.
- Controller and action.
- Request type.
- Permission configuration.
- API exposure category for topology-sensitive control-plane routes.
- Authentication or pre-authentication behavior.
- Tenant requirements.
- Cache behavior if applicable.
- Help and OpenAPI metadata.
- Expected tests.

Use HTTP methods according to behavior. `GET` is for read-only retrieval and must not create, update, run, start, stop, pause, resume, remove, publish, import, export, approve, or otherwise mutate state. Use command methods for command behavior: `POST` for actions or creation, `PATCH` for partial updates, `PUT` for complete replacement when applicable, and `DELETE` for removal.

Do not hide route behavior in controller code when route metadata owns it.

Do not add CORS, security headers, body-size limits, proxy trust, or rate-limit
behavior inside controller or service code. Those are HTTP topology decisions
owned by `nRouter` `httpHardening` configuration and may be overridden by
project, environment, server, or node layers.

## Security First

For every route, document and test:

- Whether authentication is required.
- Which permission is required.
- Whether an `apiExposure` category is required and which runtime layers enable
  it.
- Whether tenant context is required.
- Whether internal token access is allowed.
- Whether the route is intentionally pre-authentication.

Login routes are special because they happen before user authentication. Internal token and module-to-module routes must remain secured.

For control-plane APIs, permissions are not the only decision. Use
`apiExposure` when the route category should be enabled in local, development,
support, or operations topology but disabled in production-like servers by
default. Examples include test execution, file access, data import/export, log
mutation, dynamic class operations, and other diagnostics. A disabled category
must fail before route help, controller mapping, or service execution.

## Standard API Flow

A typical Nodics API flow is:

1. Request reaches the route.
2. Headers and tenant context are normalized.
3. Authentication and authorization are checked.
4. Controller receives the request.
5. Controller calls facade or service.
6. Service applies business behavior.
7. Data layer persists or reads data.
8. Response status and body are resolved.
9. Audit, diagnostics, or events are recorded when required.

## Controller, Facade, Service, Data Flow

Nodics APIs are layered APIs. Keep that separation:

- Router decides how the HTTP request enters the capability.
- Controller maps request and response concerns.
- Facade coordinates capability or cross-module behavior.
- Service owns business logic.
- DAO/provider layer owns persistence behavior.

Small APIs may call a service directly from a controller when no orchestration is needed, but the service still owns business rules. Do not put business logic directly into route definitions.

## Related Module Documentation

For exact implementation details, read:

- [nRouter](../../gFramework/nRouter/README.md) and [Router Framework](../../gFramework/nRouter/docs/router-framework.md) for route definitions, Express registration, request pipelines, security, response handlers, cache, and OpenAPI.
- [nController](../../gFramework/nController/README.md) for controller request mapping.
- [nFacade](../../gFramework/nFacade/README.md) for orchestration boundaries.
- [nService](../../gFramework/nService/README.md) for service behavior and generated CRUD service flow.
- [Module Documentation Index](../reference/module-documentation-index.md) when you need to find another owning module.

## Generated CRUD APIs

Many APIs can be generated from schema and route definitions.

If generated behavior is wrong:

- Update the source schema, route, or generator contract.
- Rebuild.
- Regenerate tests.
- Do not hand-edit generated API files as the source of truth.

Treat generated CRUD APIs as real APIs. They need route metadata, permissions, tenant behavior, generated tests, and OpenAPI output. If a generated API is not available, change the source definition or route configuration instead of deleting generated files.

## API Documentation

Nodics can generate OpenAPI documentation and expose Swagger UI for the active
runtime server or node.

OpenAPI is the structured API contract. Swagger UI is the browser page that
uses that contract to show APIs, request fields, headers, examples, and live
"try it out" calls. A new developer does not need to memorize every route
manually. Generate the contract, open Swagger UI, and inspect what the active
runtime exposes.

Run:

```bash
npm run docs:openapi
```

The OpenAPI output reflects route definitions, schema-generated APIs,
permissions, request metadata, response handlers, and API exposure categories.
If the generated documentation is wrong, fix the source route, schema,
permission, or help metadata.

At runtime, use these documentation routes when the `openApiContract` exposure
category is enabled:

| Purpose | Route | Access |
| --- | --- | --- |
| Machine-readable OpenAPI contract | `GET /nodics/system/v0/contract/openapi` | Public documentation route, exposure-gated |
| Interactive Swagger UI | `GET /nodics/system/v0/contract/swagger` | Public documentation route, exposure-gated |

Swagger UI reads the sibling OpenAPI endpoint from the same runtime. If all
modules run in one server, that server shows one consolidated API contract. If
modules are split across several servers, each server shows the routes active on
that server. If a server runs multiple identical nodes behind a load balancer,
the nodes should expose the same contract unless node-specific modules change
the route set.

The OpenAPI endpoint returns raw OpenAPI JSON so Swagger can render it. It does
not use the normal Nodics success envelope. APIs that you call from Swagger still
return their normal Nodics response objects unless that route has explicitly
chosen another response handler.

Use Swagger UI to inspect and try APIs, but remember that Nodics security is
still active. Swagger is a browser client, not a security bypass. You must
provide the same bearer token, API key, and enterprise header required by the
route. The request handler pipeline, interceptors, controller, facade, service,
cache behavior, and response handler still execute exactly as they do for a
normal API client.

Project modules can customize documentation by extending source schemas,
routers, route help metadata, permissions, or `apiExposure` configuration and
then regenerating OpenAPI. Do not edit generated OpenAPI output directly.

### First Swagger UI Walkthrough

Use this flow when learning or verifying APIs:

1. Run `npm run docs:openapi`.
2. Start the server or node.
3. Login through an authentication route or get a governed service API key for
   the active local/project environment.
4. Open `/nodics/system/v0/contract/swagger`.
5. Expand an API operation.
6. Read the method, URL, required headers, parameters, and request body.
7. For secured APIs, click `Authorize` and provide either `Bearer <token>` or
   the configured API key.
8. Click `Try it out`.
9. Provide required values, including `x-enterprise-code` when enterprise or
   tenant resolution is needed.
10. Click `Execute`.
11. Read the generated request, response code, and response body.

For a beginner-friendly first secured check, authenticate first and then call
`GET /nodics/system/v0/health/ready`. It is a small read-only endpoint, but it
still proves that Swagger is sending the same authorization context used by a
real client.

If the API fails, do not guess. Check the response code and message:

| Response | Meaning | Where to check |
| --- | --- | --- |
| Unauthorized | Token is missing, invalid, or expired | Authentication route and `Authorization` header |
| Forbidden | User is authenticated but lacks permission | Route `permission`, `permissionConfig`, and user group permissions |
| Not found | API is not active at that path | Active modules, route key, context root, API version |
| Bad request | Required field, parameter, header, or body is wrong | Route help metadata, schema validators, request body |
| Server error | Runtime behavior failed | Controller, facade, service, pipeline, logs, and tests |

### Where To Write API Code

Use this placement rule:

| What you need to do | Where to write it |
| --- | --- |
| Add HTTP URL, method, security, and help text | `src/router/routers.js` in the owning module |
| Read path/query/body/header values and shape the request context | `src/controller/**/*Controller.js` |
| Coordinate one API use case across services | `src/facade/**/*Facade.js` |
| Implement business behavior | `src/service/**/*Service.js` |
| Add generated CRUD behavior for a data type | `src/schemas/schemas.js` |
| Add validation or lifecycle checks | `src/interceptors/interceptors.js`, validators, or a pipeline node |
| Customize framework behavior for a project | Same artifact name in a later active project/environment/server/node module |

After code changes, regenerate generated artifacts and documentation instead of
editing generated files by hand.

## Testing APIs

Use route contract tests, generated API tests, and focused controller mapping tests.

Useful commands:

```bash
npm run test:generated
npm run test:basic
```

For a single named suite:

```bash
npm run test:suite -- --suite=route-contracts
```

## What To Avoid

Avoid:

- Adding unsecured routes without explicit reason.
- Relying only on controller checks for permissions.
- Creating undocumented route behavior.
- Returning inconsistent response shapes.
- Editing generated route files manually.
- Mixing human login and internal service access rules.
