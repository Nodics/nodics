# nRouter

`nRouter` owns request routing, secured request pipelines, route action
authorization, OpenAPI generation, and route metadata governance.

Detailed router framework documentation is maintained in
[docs/router-framework.md](docs/router-framework.md).

Routes may define literal `permission` or `permissions` values for fixed
platform actions. When a permission is expected to vary by project,
environment, server, node, tenant, or runtime governance, prefer
`permissionConfig` with a layered configuration path such as
`authSecurity.internalToken.routePermission`. The secured request pipeline
resolves that value from effective configuration before checking the
authenticated principal's permissions.

## Developer Guidance

Router guidance covers route registration, special routers, request objects,
response objects, and generated CRUD-style retrieve/save/update/remove
examples. Current router behavior must follow the security and
runtime-governance contracts in this module.

Routers are the HTTP/API contract across route definitions, Express app
configuration, Express method binding, the request handler pipeline, secured or
non-secured request branches, controller dispatch, response handlers, cache, and
OpenAPI output.

Routers declare HTTP contract and access policy. Controllers map request
data into Nodics request context. Facades and services own behavior. Do not put
database operations or project-specific policy directly into router code.

## Route Registration

Route registration exposes generated and custom behavior over HTTP. Current Nodics keeps that contract in
`src/router/routers.js` and related app configuration.

A route contribution describes:

- method and URL;
- controller and action;
- request type;
- security and permission configuration;
- tenant/request context expectations;
- cache behavior if any;
- generated API/OpenAPI impact;
- tests that prove the route works and is secured correctly.

Common routes that apply across capabilities must be owned by the module that
provides the common capability. Module-specific routes must stay with the
module that owns the schema/service behavior.

## Generated CRUD Routes

Generated retrieve, save, update, and remove routes are real platform
contracts. They trace to schema and router source definitions,
permission metadata, generated tests, and OpenAPI output.

If a generated route is wrong, fix the schema, route metadata, generator, or
configuration that produced it. Do not patch generated route output directly.

When exposing generated CRUD behavior, document:

- target module and schema;
- URL shape;
- supported query/body fields;
- tenant behavior;
- permission requirements;
- validation and failure responses;
- generated test coverage.

## Request, Response, And Context

Request handling must normalize tenant, authentication, authorization,
correlation, headers, and module context before business behavior runs.

Controllers map request and response concerns. They do not become
the owner of data access, provider selection, tenant policy, or route
permission decisions. Those belong to schemas, configuration, services,
runtime governance, and route metadata.

## Extension Contract

Later modules may add, replace, disable, or govern routes through source
definitions, layered configuration, runtime governance, and tests. Any route
change must document permissions, tenant context, generated artifacts, OpenAPI
impact, and override behavior.

The request handler pipeline does not currently execute `DefaultInterceptorService`
as a built-in router step. Router customization should use route metadata,
`src/router/appConfig.js`, request pipeline definitions, request pipeline
services, controllers, or downstream capability interceptors depending on where
the behavior belongs.
