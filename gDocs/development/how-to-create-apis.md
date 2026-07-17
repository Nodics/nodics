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
- Authentication or pre-authentication behavior.
- Tenant requirements.
- Cache behavior if applicable.
- Help and OpenAPI metadata.
- Expected tests.

Use HTTP methods according to behavior. `GET` is for read-only retrieval and must not create, update, run, start, stop, pause, resume, remove, publish, import, export, approve, or otherwise mutate state. Use command methods for command behavior: `POST` for actions or creation, `PATCH` for partial updates, `PUT` for complete replacement when applicable, and `DELETE` for removal.

Do not hide route behavior in controller code when route metadata owns it.

## Security First

For every route, document and test:

- Whether authentication is required.
- Which permission is required.
- Whether tenant context is required.
- Whether internal token access is allowed.
- Whether the route is intentionally pre-authentication.

Login routes are special because they happen before user authentication. Internal token and module-to-module routes must remain secured.

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

Nodics can generate OpenAPI documentation.

Run:

```bash
npm run docs:openapi
```

The OpenAPI output reflects route definitions and permissions. If the generated documentation is wrong, fix the source route metadata.

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
