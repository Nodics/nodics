# nRouter

`nRouter` is the controlled front door to Nodics APIs. It decides which URL and
HTTP method exist, how a request enters the platform, whether that API category
is enabled, and which authentication and permission rules apply before
business behavior runs.

`nRouter` owns request routing, secured request pipelines, route action
authorization, OpenAPI generation, and route metadata governance.

Detailed router framework documentation is maintained in
[docs/router-framework.md](docs/router-framework.md).

## When To Use This Module

Use `nRouter` for framework-wide route loading, Express binding, request
pipeline behavior, HTTP hardening, route authorization, API exposure policy,
OpenAPI generation, and response contracts. Put a business API definition in
the business module that owns it; use the router framework contract rather than
moving that route into `nRouter`.

Routes may define literal `permission` or `permissions` values for fixed
platform actions. When a permission is expected to vary by project,
environment, server, node, tenant, or runtime governance, prefer
`permissionConfig` with a layered configuration path such as
`authSecurity.internalToken.routePermission`. The secured request pipeline
resolves that value from effective configuration before checking the
authenticated principal's permissions.

Sensitive runtime, diagnostic, file, import, export, test, dynamic class, and
maintenance APIs must also declare an `apiExposure` category. The request
handler pipeline checks `apiExposure.categories.<category>.enabled` before route
help, controller dispatch, or business behavior runs. This is a topology gate:
permissions answer "who may call this API"; `apiExposure` answers "should this
API category exist in this runtime at all."

Framework defaults keep operational configuration, schema maintenance, and
OpenAPI contract APIs available, while file access, data import/export, log
mutation, test execution, and dynamic class APIs are disabled unless a
project/environment/server/node layer enables them. Developer servers such as
`startioLocal` may opt in through layered `config/properties.js`; production-like
servers should enable only the categories required for their operational model.

Runtime API documentation follows the same route-governance model. OpenAPI is
generated from effective router and schema contracts with `npm run
docs:openapi`, exposed at `/nodics/system/v0/contract/openapi`, and viewed
interactively through `/nodics/system/v0/contract/swagger`. Swagger UI is served
through normal Nodics routes and guarded by the `openApiContract` exposure
category, so local developer servers can open documentation in a browser while
production-like environments can disable documentation exposure through layered
configuration. Projects can override policy, branding, filtering, and asset
handling without adding hidden Express middleware.

## HTTP Hardening

`nRouter` also owns framework-level HTTP hardening through
`httpHardening` configuration and `DefaultHttpHardeningService`. This policy is
applied during Express app initialization before body parsing and route
dispatch.

The default policy:

- keeps CORS closed unless a project/environment/server/node layer enables
  allowed origins;
- applies security headers such as `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and resource policy headers;
- keeps proxy trust disabled unless the deployment topology explicitly enables
  it;
- applies bounded body parser limits for URL-encoded, JSON, and text payloads;
- applies a per-process rate limit as a framework guardrail.

Use layered `config/properties.js` to change HTTP behavior for local,
development, support, production, server, or node topology. Do not add ad hoc
CORS, header, body limit, proxy, or rate-limit middleware inside controllers or
capability services. If a product needs provider-grade rate limiting, API
gateway integration, or service-mesh policy, override or replace
`DefaultHttpHardeningService` while preserving the property contract.

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
- runtime/topology exposure category when the route is sensitive;
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

## Integration Map

| Layer | Responsibility |
| --- | --- |
| Route definition | Declares method, path, controller/action, security, permissions, exposure, cache, and API metadata. |
| Controller | Maps HTTP input and output into Nodics request/response context. |
| Facade | Coordinates several services when orchestration is needed. |
| Service | Owns reusable business and integration behavior. |
| Schema | Supplies data, validation, access, and generated API contracts. |
| `nAuth` and `nToken` | Establish authenticated identity and token behavior; router authorization consumes that identity. |
| `nSystem` | Exposes governed contract, health, and selected control-plane APIs. |

## Observability, Performance, And Failure Behavior

Requests should retain correlation, tenant, module, route, action, and safe
status context through success and failure paths. Do not include tokens,
credentials, or uncontrolled response bodies in diagnostics.

Body limits, rate limits, CORS, headers, proxy trust, caching, and exposure
policy must be resolved before expensive business work. A disabled API category
or unauthorized request must fail before controller or service execution.
Per-process rate limiting is a guardrail, not a substitute for a distributed
gateway policy when a deployment requires global enforcement.

## Verification

```bash
node gFramework/nRouter/test/httpHardeningContract.test.js
node gFramework/nRouter/test/routeActionAuthorization.test.js
node gFramework/nRouter/test/controlPlaneRouteContract.test.js
node gFramework/nRouter/test/requestPipelineResponseContract.test.js
node gFramework/nRouter/test/openapiContractGeneration.test.js
npm run docs:openapi
npm run quality:docs
```

For a changed business route, also run the owning module's positive,
unauthorized, forbidden, invalid-input, boundary, generated API, scenario, and
integration tests.

## Common Mistakes

- Putting business or database behavior in a route definition.
- Marking a human login route and an internal service route with the same
  credential assumptions.
- Using only a broad user group for a sensitive control-plane operation.
- Enabling a sensitive API in production merely because the caller has a
  permission; exposure and authorization are separate gates.
- Editing generated routes or OpenAPI output directly.

## Continue

- Public API guide: [How To Create APIs](../../gDocs/development/how-to-create-apis.md)
- Security guide: [How Users, Tenants, And Permissions Work](../../gDocs/security/how-users-tenants-and-permissions-work.md)
- Detailed framework: [Router Framework](docs/router-framework.md)
- Framework map: [gFramework](../README.md)
