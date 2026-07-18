# Nodics Router Framework

Routers are the Nodics HTTP exposure contract. A router is not just one route
object. The router framework includes route definitions, schema-generated route
templates, Express application setup, Express route binding, body and response
handlers, the request handler pipeline, secured authorization, controller
dispatch, API cache behavior, OpenAPI output, and tests.

Use this guide when you need to define, expose, secure, customize, or debug a
Nodics API.

## What Routers Own

Routers declare the public API contract. They answer:

- which HTTP method is exposed;
- which URL is exposed;
- which module owns the route;
- whether the route is secured;
- which access groups and permissions are required;
- which body parser and response handler should be used;
- which controller and operation receive the request;
- whether API response cache can be used;
- what help and OpenAPI metadata should say.

Routers should not own business logic, persistence, provider calls, tenant
shortcuts, or project-specific policy. After the request is normalized and
authorized, controllers map request data, facades orchestrate behavior, and
services/pipelines own business execution.

## Router Source Files

Router-enabled modules use these standard files:

- `src/router/routers.js`: route definitions and route templates.
- `src/router/appConfig.js`: Express app configuration hooks.
- `src/pipelines/pipelines.js`: request handling and security pipelines when
  the module owns pipeline behavior.
- `src/controller/**/*Controller.js`: custom request mapping or generated
  controller operations.
- `config/properties.js`: body parser handlers, response handlers, cache,
  route action authorization, and other configurable router policy.

In `nRouter`, the core files are:

- `src/router/routers.js` for default CRUD templates and common routes.
- `src/router/appConfig.js` for Express middleware hooks.
- `src/pipelines/pipelines.js` for `requestHandlerPipeline`,
  `handleSecuredRequestPipeline`, and `handleNonSecuredRequestPipeline`.
- `src/service/router/defaultRouterService.js` for router generation,
  registration, URL construction, and server startup.
- `src/service/router/defaultRouterOperationService.js` for Express method
  binding.
- `src/service/defaultRequestHandlerService.js` for entering the request
  pipeline.
- `src/service/request/defaultRequestHandlerPipelineService.js` for normal
  request handling.
- `src/service/request/defaultSecuredRequestPipelineService.js` for API key,
  bearer token, access group, and route permission checks.
- `src/service/request/defaultNonSecuredRequestPipelineService.js` for
  enterprise and tenant resolution on non-secured routes.

## Route Definition Shape

A route definition normally includes:

```javascript
sampleRoute: {
    active: true,
    secured: true,
    accessGroups: ['userGroup'],
    permissionConfig: 'sampleSecurity.routes.readPermission',
    key: '/sample/:code',
    method: 'GET',
    controller: 'DefaultSampleController',
    operation: 'getByCode',
    apiVersion: 'v0',
    bodyParserHandler: 'jsonBodyParserHandler',
    responseHandler: 'jsonResponseHandler',
    cache: {
        enabled: false,
        ttl: 60
    },
    help: {
        requestType: 'secured',
        method: 'GET',
        url: 'http://host:port/nodics/sample/v0/sample/:code'
    }
}
```

Required security metadata must not be skipped. `DefaultRouterService` rejects
router definitions that do not define non-empty `accessGroups`.

Use `permission` or `permissions` when the action permission is fixed. Use
`permissionConfig` when the required permission is configurable by project,
environment, server, node, tenant, or runtime governance.

## Generated CRUD Routes

`nRouter/src/router/routers.js` contains default CRUD route templates under
`default`.

When a schema enables service and router behavior, `DefaultRouterService`
generates standard routes from those templates. During generation:

1. `schemaName` in the route key is replaced with the schema alias or schema
   name.
2. `DefaultctrlName` becomes the generated controller name, such as
   `DefaultProductController`.
3. API version defaults to `v0` when not specified.
4. The full URL is built as
   `/{contextRoot}/{modulePrefix}/{apiVersion}{routeKey}`.
5. The router is named as `{moduleName}_{schemaName}_{operation}`.
6. Router cache settings are merged with `cache.routerLevelCache` when defined.
7. The final route is stored in the Nodics runtime registry.
8. The route is bound to Express.

For example, a schema named `product` in module `catalog` can produce:

```text
GET /nodics/catalog/v0/product
GET /nodics/catalog/v0/product/id/:id
GET /nodics/catalog/v0/product/code/:code
PUT /nodics/catalog/v0/product
PUT /nodics/catalog/v0/product/all
PATCH /nodics/catalog/v0/product
DELETE /nodics/catalog/v0/product
```

The generated route points to generated controllers, and generated controllers
delegate to facades/services/pipelines. Do not hand-edit generated controller,
facade, service, route, or test artifacts. Change the schema/router definition
and regenerate.

## Express Application Setup

Router startup has two levels:

1. Express app and router initialization.
2. Route registration and server startup.

`DefaultRouterInitializerService.initializeRouters` creates Express app and
router instances for router-enabled modules. If a module has its own server
configuration, it receives its own app and router. If not, it uses the default
consolidated app/router.

`DefaultRouterConfigurationService.configureRouters` applies
`src/router/appConfig.js` hooks to the Express app:

- `initProperties`;
- `initSession`;
- `initLogger`;
- `initCache`;
- `initBodyParser`;
- `initHeaders`;
- `initErrorRoutes`;
- `initExtras`.

These hooks are the correct place for Express middleware such as CORS, request
logging, security headers, session handling, payload limits, app-level error
handlers, or HTTP tracing. They are app middleware extension points, not Nodics
pipeline interceptors.

## Express Route Registration

`DefaultRouterService.registerRouter` iterates all active router-enabled
modules and calls `activateRouters`.

`activateRouters` registers three groups:

- schema-generated default routers;
- common routers that apply to router-enabled modules;
- module-specific routers.

`prepareDefaultRouter` and `prepareRouter` build the effective route
definition, add it to the Nodics runtime registry with `NODICS.addRouter`, and
delegate Express binding to `DefaultRouterOperationService`.

`DefaultRouterOperationService` binds the HTTP method:

```javascript
moduleRouter.get(routerDef.url, (req, res) => {
    this.bindOperation(req, res, routerDef);
});

moduleRouter.post(routerDef.url, bodyParser, (req, res) => {
    this.bindOperation(req, res, routerDef);
});
```

For POST, PUT, PATCH, and DELETE, the configured body parser handler is resolved
from `CONFIG.get('bodyParserHandler')`. If the route does not specify one, the
JSON parser handler is used.

On every request, `bindOperation` refreshes the active router definition from
`NODICS.getRouter`. That lets runtime route activation and governance affect
the next request. If the route is inactive, the configured response handler
returns a standard error response.

## Request Handler Entry Point

After Express matches a route, `DefaultRequestHandlerService.startRequestHandler`
creates a Nodics request context:

```javascript
{
    requestId: UTILS.generateUniqueCode(),
    parentRequestId: request.get('requestId'),
    router: routerDef,
    httpRequest: request,
    httpResponse: response,
    protocal: request.protocol,
    host: request.hostname,
    originalUrl: request.originalUrl,
    secured: routerDef.secured,
    moduleName: routerDef.moduleName,
    special: routerDef.controller ? false : true,
    method: request.method,
    body: request.body || {}
}
```

Then it starts:

```javascript
SERVICE.DefaultPipelineService.start('requestHandlerPipeline', input, {});
```

The final success or error is sent through the configured response handler, such
as `jsonResponseHandler`, `textResponseHandler`, or `fileDownloadResponseHandler`.

## Request Handler Pipeline

`requestHandlerPipeline` is the main request lifecycle:

1. `helpRequest`
2. `parseHeader`
3. `parseBody`
4. `handleSpecialRequest`
5. `redirectRequest`
6. `handleSecuredRequest` or `handleNonSecuredRequest`
7. `lookupCache`
8. `handleRequest`
9. `successEnd`

### `helpRequest`

If the original URL ends with `?help`, the pipeline returns the route help
metadata and stops. This lets the route explain its method, URL, request type,
and expected payload without reaching controller logic.

### `parseHeader`

Header parsing normalizes modern and supported compatibility headers into
`request.auth`.

Preferred headers are:

- `Authorization: Bearer <token>`;
- `x-api-key`;
- `x-enterprise-code`.

Supported compatibility headers are:

- `authToken`;
- `apiKey`;
- `entCode`.

The pipeline writes `request.apiKey`, `request.authToken`, and
`request.entCode` when present. If neither credentials nor enterprise code are
available, the pipeline raises `ERR_AUTH_00002`.

### `parseBody`

Body parsing is normally handled by Express body parser handlers before the
Nodics pipeline starts. This node remains as an override point for request
context enrichment or body normalization.

### `handleSpecialRequest`

Special routes bypass normal controller dispatch when the route uses
`handler`/`operation` instead of `controller`/`operation`. This is useful for
framework-level utility routes. Special handlers should still preserve tenant
and response contracts.

### `redirectRequest`

This node decides whether the request goes into the secured or non-secured
branch. It sets:

```javascript
response.targetNode = 'securedRequest';
```

or:

```javascript
response.targetNode = 'nonSecureRequest';
```

The pipeline success map routes to the correct nested pipeline.

### `lookupCache`

API response cache lookup happens after tenant/security context has been
resolved and before controller dispatch. On cache hit, the pipeline clones the
cached response, marks it with `cache: 'api hit'`, and stops. On cache miss, it
continues to the controller.

### `handleRequest`

This node calls:

```javascript
CONTROLLER[request.router.controller][request.router.operation](request, callback);
```

The controller returns a standard Nodics success/error object. Successful
responses may be written to API cache if route cache policy allows it.

## Secured Request Pipeline

`handleSecuredRequestPipeline` protects secured routes before controller
execution:

1. `validateSecuredRequest`
2. `authorizeAPIKey`
3. `authorizeAuthToken`
4. `validateRequestData`
5. `checkAccess`
6. `successEnd`

`validateSecuredRequest` requires exactly one supported credential. Ambiguous
requests with both API key and bearer token are rejected.

`authorizeAPIKey` uses `DefaultAuthorizationProviderService.authorizeAPIKey` and
builds `request.authData` with enterprise, tenant, person, user groups, and
permissions.

`authorizeAuthToken` uses `DefaultAuthorizationProviderService.authorizeToken`
and writes authenticated principal data to `request.authData`.

`validateRequestData` requires enterprise and tenant context.

`checkAccess` enforces:

- route access groups through `router.accessGroups`;
- action permissions through `router.permission`, `router.permissions`, and
  `router.permissionConfig`;
- route action authorization configuration from
  `CONFIG.get('routeActionAuthorization')`.

This is how Nodics separates pre-authentication routes, normal secured human
routes, API key access, and internal/module-to-module token routes.

## Non-Secured Request Pipeline

`handleNonSecuredRequestPipeline` is for routes marked `secured: false`.

It resolves enterprise and tenant context from the enterprise code path before
the controller runs. Use this only for routes that must be reachable before
authentication, such as login or public bootstrap flows. Do not mark internal
module-to-module routes non-secured just because they are called by services;
use proper service credentials and route permissions instead.

## Controller Registration And Dispatch

Controllers are loaded from active modules under `src/controller`. Generated
controllers live under `src/controller/gen` and are recreated by clean/build
from schema definitions and controller templates.

During framework startup, controllers are merged into the global `CONTROLLER`
registry by controller file name. Later active modules can contribute the same
controller name and override individual exported functions.

A route chooses the controller and operation:

```javascript
controller: 'DefaultProductController',
operation: 'get'
```

At runtime, the request pipeline dispatches to:

```javascript
CONTROLLER.DefaultProductController.get(request, callback);
```

Controllers should map route params, query, headers, and body into Nodics
request context, then call facades. They should not own persistence, provider
selection, access policy, or business behavior.

## Interceptors And Router Customization

The request handler pipeline does not currently execute `DefaultInterceptorService`
as a built-in router step. Database, search, import, export, workflow, and other
capability pipelines have their own interceptor and processor lifecycle where
that behavior belongs.

Router-level customization should use the correct extension point:

- route metadata in `src/router/routers.js` for URL, method, security,
  permission, cache, body parser, response handler, and controller mapping;
- `src/router/appConfig.js` for Express middleware such as headers, CORS,
  session, logging, payload limits, and app-level error handling;
- `src/pipelines/pipelines.js` to add, remove, or reorder request pipeline
  nodes;
- `src/service/request/**/*Service.js` to customize request pipeline node
  behavior;
- `src/service/router/**/*Service.js` to customize router registration or
  Express binding behavior;
- `src/controller/**/*Controller.js` to customize request mapping;
- facades/services/pipelines in the owning capability module for business
  behavior;
- schema/data/search/import/export interceptors when the behavior belongs to
  the domain lifecycle rather than the HTTP boundary.

If a project needs a router interceptor concept, implement it explicitly as a
pipeline node in a later module, document the request/response contract, and
prove it with tests. Do not create an invisible interceptor path outside the
pipeline or loader structure.

## Customizing The Request Pipeline

To add a request tracing step after headers are parsed:

```javascript
module.exports = {
    requestHandlerPipeline: {
        nodes: {
            parseHeader: {
                type: 'function',
                handler: 'DefaultRequestHandlerPipelineService.parseHeader',
                success: 'captureRequestTrace'
            },
            captureRequestTrace: {
                type: 'function',
                handler: 'DefaultCustomerRequestPipelineService.captureRequestTrace',
                success: 'parseBody'
            }
        }
    }
};
```

Then add the service in the later module:

```javascript
module.exports = {
    captureRequestTrace: function (request, response, process) {
        request.trace = request.trace || {};
        request.trace.receivedAt = new Date();
        process.nextSuccess(request, response);
    }
};
```

This preserves the framework route contract while adding customer behavior in a
clean override layer.

## Defining A Custom Route

Add a module-specific route in the owning module's `src/router/routers.js`:

```javascript
module.exports = {
    sample: {
        operations: {
            getSampleSummary: {
                active: true,
                secured: true,
                accessGroups: ['sampleViewerUserGroup'],
                permissionConfig: 'sampleSecurity.routes.summaryPermission',
                key: '/sample/summary/:code',
                method: 'GET',
                controller: 'DefaultSampleController',
                operation: 'getSummary',
                apiVersion: 'v0',
                responseHandler: 'jsonResponseHandler',
                cache: {
                    enabled: true,
                    ttl: 120
                },
                help: {
                    requestType: 'secured',
                    method: 'GET',
                    url: 'http://host:port/nodics/sample/v0/sample/summary/:code'
                }
            }
        }
    }
};
```

Then implement `DefaultSampleController.getSummary` under
`src/controller/defaultSampleController.js`. The controller should call the
owning facade/service and return a standard Nodics response object.

## Security Rules

For every route:

- default to `secured: true`;
- define `accessGroups`;
- use `permissionConfig` for configurable action permissions;
- keep login/pre-authentication routes narrow and explicit;
- keep internal/module-to-module routes secured;
- do not hardcode permission values that should vary by project or environment;
- do not bypass `DefaultAuthorizationProviderService` from controllers;
- preserve tenant and authenticated principal context;
- add tests for allowed, denied, missing credential, and inactive route cases.

## Response Objects

Success and error handling is controlled by the route response handler. The
default JSON handler writes stable JSON envelopes and status codes. Router
binding errors and inactive route errors also go through the configured
response handler when possible.

A controller should return success in the framework shape expected by the
response handler, for example:

```javascript
{
    code: 'SUC_SAMPLE_00000',
    result: {
        code: 'sample-001'
    }
}
```

Errors should use Nodics error classes so response handlers can serialize code,
message, response code, metadata, and trace context consistently.

Textual routes can use `textResponseHandler`. The handler supports two shapes:

```javascript
'plain text response'
```

or:

```javascript
{
    data: '<html></html>',
    metadata: {
        contentType: 'text/html; charset=utf-8'
    }
}
```

Use this for governed text, HTML, JavaScript, CSS, CSV previews, or other
already-formatted textual artifacts when the route must not be wrapped in the
standard JSON response envelope. Keep the response content owned by a service,
not by direct Express middleware hidden outside the Nodics loader path.

## OpenAPI And Swagger UI

Nodics exposes API documentation in two related but different forms:

- OpenAPI is the machine-readable runtime contract.
- Swagger UI is the interactive human console that reads that contract and lets
  a developer inspect and try APIs.

In simple terms, OpenAPI is the API list in a structured JSON format. Tools can
read it and understand which APIs exist, which HTTP method each API uses, which
headers are required, what request body is expected, and what response shape is
returned. Swagger UI is the browser page that turns that OpenAPI JSON into a
readable and clickable API console.

Both belong to the active runtime boundary. This is important because Nodics is
not a single fixed API application. A project may run all modules in one server,
split modules across several servers, or run multiple nodes of the same server
behind a load balancer. Documentation must therefore describe what is actually
active in that runtime, not a separate static list.

For a new developer, the important rule is: Swagger UI does not create APIs. It
only shows the APIs that Nodics already registered through routers and generated
from schemas. If an API is missing from Swagger UI, look at the route or schema
source definition first.

### Runtime Boundary Rule

Use this rule when generating or exposing API documentation:

- If the application runs as one consolidated server, that server exposes one
  OpenAPI contract and one Swagger UI for all active routes.
- If the application is split into multiple runtime servers, each server exposes
  its own OpenAPI contract and Swagger UI for the routes active on that server.
- If several nodes run the same server behind a load balancer, they normally
  expose the same contract. If a node layer adds or removes routes, the node
  contract must reflect that node's effective module hierarchy.
- A future central documentation server may aggregate multiple runtime
  contracts, but it must not become the source of route truth. It should collect
  contracts from runtimes and present them together.

### Generated Contract Endpoint

The OpenAPI artifact is generated from effective schemas and routers:

```bash
npm run docs:openapi
```

The generated artifact is written under the active server or node generated
directory:

```text
<server-or-node>/generated/openapi/<server-or-node>.openapi.json
```

At runtime, `nSystem` exposes the active contract through:

```text
GET /nodics/system/v0/contract/openapi
```

This route is browser-accessible when the `openApiContract` exposure category is
enabled. It is marked with `publicAccess: true`, and the request pipeline also
treats the `openApiContract` category itself as public documentation so older
persisted router rows cannot block Swagger behind header parsing. Swagger UI
must fetch the OpenAPI JSON from the browser before a developer can try secured
APIs. Shared, support, staging, and production-like environments should disable
`apiExposure.categories.openApiContract.enabled` unless API documentation is
intentionally published for that environment.

The OpenAPI endpoint returns the OpenAPI document itself as raw JSON, with the
`openapi` field at the top level. It does not wrap that document in the normal
Nodics `{ code, data, metadata }` response envelope because Swagger UI and other
OpenAPI clients expect the standard document shape.

The generator reads route metadata such as:

- `key`, `method`, `controller`, and `operation`;
- `secured`, `publicProbe`, `publicAccess`, `accessGroups`, `permission`, and
  `permissionConfig`;
- `apiExposure`;
- `responseHandler`;
- route `help` metadata;
- schema-driven generated CRUD routes.

If OpenAPI output is wrong, fix the source route, schema, permission, or help
metadata. Do not hand-edit generated OpenAPI files as source truth.

### What A User Sees

When a user opens Swagger UI, each API operation normally shows:

- HTTP method, such as `GET`, `POST`, `PATCH`, or `DELETE`;
- URL path, such as `/nodics/profile/v0/customer`;
- route description from the route `help` metadata;
- path parameters, query parameters, headers, and request body;
- security requirements;
- response examples and response status codes.

The HTTP method matters:

- `GET` reads information and must not change data.
- `POST` usually creates something or runs a command.
- `PATCH` updates part of an existing resource.
- `PUT` replaces or saves a complete resource when the route contract says so.
- `DELETE` removes data or disables a resource when the route contract says so.

Swagger UI is useful because a developer can inspect the contract and try an API
without writing client code first. The same API still goes through the Nodics
request pipeline, so Swagger UI is not a shortcut around validation or security.

### Swagger UI Endpoint

Swagger UI is available at:

```text
GET /nodics/system/v0/contract/swagger
```

This route is browser-accessible when the same `openApiContract` exposure
category is enabled. It loads the active runtime OpenAPI contract from the
sibling `openapi` endpoint, so the browser always reads the same server or node
contract that the runtime exposes.

The UI assets are served through governed Nodics routes:

```text
GET /nodics/system/v0/contract/swagger/asset/:assetName
```

Only approved Swagger UI assets from the local `swagger-ui-dist` package are
served. This keeps Swagger self-hosted and avoids creating a general-purpose
file server. Project modules may override `DefaultApiContractService` in a later
active layer to change branding, filter operations, add environment banners,
hide sensitive internal APIs, or use a different UI package while preserving the
same route contract.

### How To Use It

For a developer server:

1. Generate the latest contract with `npm run docs:openapi`.
2. Start the server or node.
3. Confirm `apiExposure.categories.openApiContract.enabled` is not disabled for
   the active environment, server, or node.
4. Open `/nodics/system/v0/contract/swagger` in the browser.
5. Use Swagger UI to inspect route parameters, headers, request body, response
   examples, and security requirements.

For a first manual check on a public route:

1. Open the Swagger UI page.
2. Find a simple read API.
3. Click the API row to expand it.
4. Click `Try it out`.
5. Fill required path, query, header, and body fields.
6. Add the same authorization token that would be used from Postman or a client
   application.
7. Click `Execute`.
8. Read the request URL, response code, response body, and error message.

For a secured route:

1. Login through a pre-authentication route, such as
   `POST /nodics/profile/v0/employee/authenticate`, or obtain a governed service
   API key from the active local/project environment.
2. Click the `Authorize` button in Swagger UI.
3. For bearer access, paste the token as `Bearer <token>`.
4. For API-key access, paste the configured key into the API-key authorization
   field.
5. Expand a secured API, such as
   `GET /nodics/system/v0/health/ready`.
6. Click `Try it out`.
7. Provide `x-enterprise-code` when the route or environment needs enterprise or
   tenant resolution.
8. Click `Execute`.

When using Swagger UI's "Try it out" capability, supply the same authorization
header or API key you would use from Postman or a client application. Nodics
route security, tenant context, API exposure gates, request pipelines,
interceptors, controllers, facades, and services still run normally.

Common headers:

| Header | Purpose |
| --- | --- |
| `Authorization` | Carries the user or service token as `Bearer <token>`. Most secured APIs require either this header or a configured API key. |
| `x-api-key` | Carries a governed API key for service or bootstrap flows that allow API-key authentication. |
| `x-enterprise-code` | Identifies the enterprise context used for tenant resolution. Legacy `entCode` is deprecated. |

If a request fails:

| Symptom | Likely reason | What to check |
| --- | --- | --- |
| Swagger page does not open | `openApiContract` exposure is disabled or the contract file is missing | Check `apiExposure.categories.openApiContract.enabled` and run `npm run docs:openapi` |
| OpenAPI JSON is missing | Contract was not generated or active server/node context is wrong | Run `npm run docs:openapi` and check the generated server or node path |
| API returns unauthorized | Missing or invalid token | Login again and pass `Authorization: Bearer <token>` |
| API returns forbidden | Token is valid but user lacks route permission | Check route `permission`, `permissionConfig`, and user group permissions |
| API returns tenant or enterprise error | Required runtime context is missing | Add the required Nodics enterprise and tenant headers |
| API is missing from Swagger | Route or schema is not active in this runtime | Check active modules, route definitions, schema router flags, and OpenAPI generation output |

### Customization Points

Use these extension points:

- Route availability: override `apiExposure.categories.openApiContract.enabled`
  in layered `config/properties.js`.
- Permission policy: override route `permission` or `permissionConfig` through
  the owning router layer or later project module.
- UI behavior: override `DefaultApiContractService.getSwaggerUi` or
  `buildSwaggerUiHtml`.
- Asset policy: override `getSwaggerAsset`, `isAllowedSwaggerAsset`, or
  `resolveSwaggerAssetPath`.
- Contract generation: extend source schemas, routers, and help metadata, then
  regenerate OpenAPI.

Do not add Swagger directly as ad hoc Express middleware outside the Nodics
route/controller/facade/service structure. That would create a second API
exposure path that bypasses the framework's route metadata, permissions,
exposure gates, tests, and override model.

### Where To Change Code

Use this map before editing:

| Need | Write code here | Reason |
| --- | --- | --- |
| Add a new custom API | Owning module `src/router/routers.js`, `src/controller`, `src/facade`, and `src/service` | Routers expose the HTTP contract; controller/facade/service own behavior |
| Add generated CRUD APIs for a schema | Owning module `src/schemas/schemas.js` | Schema definitions drive generated routers, controllers, services, tests, and OpenAPI |
| Change route permission | Owning route definition or layered `permissionConfig` property | Security must be visible in route metadata |
| Enable or disable API documentation routes | Layered `config/properties.js` under `apiExposure.categories.openApiContract.enabled` | Topology decides whether this API family exists in a runtime |
| Change Swagger UI branding or filtering | Later module override of `DefaultApiContractService` | UI behavior is service-owned and overrideable |
| Change generated OpenAPI content | Source schemas, route metadata, controller docs, or help metadata | Generated output is not source truth |

After any API documentation change, run:

```bash
npm run docs:openapi
npm run llm:generate
npm run llm:validate
npm run quality:docs
npm run test:basic
```

## Testing Router Changes

Router changes should include focused tests for the behavior being changed.
Current examples:

- `gFramework/nRouter/test/authHeaderNormalization.test.js`;
- `gFramework/nRouter/test/jsonResponseStatusResolution.test.js`;
- `gFramework/nRouter/test/openapiContractGeneration.test.js`;
- `gFramework/nRouter/test/requestPipelineResponseContract.test.js`;
- `gFramework/nRouter/test/routeActionAuthorization.test.js`.
- `gFramework/nRouter/test/textResponseHandlerContract.test.js`.

Tests should prove:

- route metadata is valid;
- generated routes resolve correct controller and operation names;
- secured routes reject missing or ambiguous credentials;
- access groups and route permissions are enforced;
- `permissionConfig` resolves from layered configuration;
- non-secured routes still resolve enterprise and tenant context;
- request pipeline success returns the expected response envelope;
- request pipeline errors return the expected response envelope;
- inactive routes use configured response handlers;
- controller dispatch receives normalized request context;
- route cache hits do not mutate cached payloads;
- OpenAPI output reflects the effective route contract.

Run:

```bash
node gFramework/nTooling/bin/nodics-tool.js test:suite --suite=headers
npm run docs:openapi
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

## Documentation Checklist

When adding or changing a route, document:

- owning module and route group;
- URL, method, API version, and context root behavior;
- secured or non-secured behavior;
- access groups and route permissions;
- body parser and response handler;
- controller and operation;
- request params, query, headers, and body shape;
- tenant and auth context expectations;
- cache behavior;
- pipeline customization points;
- downstream facade/service/pipeline behavior;
- tests and OpenAPI impact.

## What To Avoid

Avoid:

- putting business logic in routers;
- putting persistence or provider calls in controllers;
- marking routes non-secured because authorization is inconvenient;
- adding Express middleware when a Nodics pipeline node is the correct
  extension point;
- adding Nodics pipeline nodes when simple Express middleware is the correct
  app-level concern;
- inventing router interceptors outside the loader-visible pipeline/service
  structure;
- hardcoding tenant, customer, server, node, provider, permission, or secret
  values;
- editing generated controllers or generated route artifacts directly;
- skipping OpenAPI, test, README, and generated LLM context updates.
