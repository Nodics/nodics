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

## Testing Router Changes

Router changes should include focused tests for the behavior being changed.
Current examples:

- `gFramework/nRouter/test/authHeaderNormalization.test.js`;
- `gFramework/nRouter/test/jsonResponseStatusResolution.test.js`;
- `gFramework/nRouter/test/openapiContractGeneration.test.js`;
- `gFramework/nRouter/test/requestPipelineResponseContract.test.js`;
- `gFramework/nRouter/test/routeActionAuthorization.test.js`.

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

