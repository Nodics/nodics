# How To Create APIs

APIs are the main way external systems and clients interact with a Nodics application.

An API should have a clear owner, route definition, permission rule, request contract, response contract, and test coverage.

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

Do not put unrelated APIs into a central controller just because it is easy to find. A route should be close to the schema, service, controller, tests, and documentation for the capability it exposes.

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

## Generated CRUD APIs

Many APIs can be generated from schema and route definitions.

If generated behavior is wrong:

- Update the source schema, route, or generator contract.
- Rebuild.
- Regenerate tests.
- Do not hand-edit generated API files as the source of truth.

## API Documentation

Nodics can generate OpenAPI documentation.

Run:

```bash
npm run docs:openapi
```

The OpenAPI output should reflect route definitions and permissions. If the generated documentation is wrong, fix the source route metadata.

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

