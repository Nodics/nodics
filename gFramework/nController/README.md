# nController

`nController` owns the HTTP/controller boundary between routers and facades.

Controllers translate inbound request data into Nodics request context and call
facade contracts. They should not own persistence, tenant lookup shortcuts, or
business behavior that belongs in services or facades.

## Ownership

Controllers should:

- normalize request params, headers, query, and body;
- preserve tenant, enterprise, principal, and trace context;
- call facade contracts;
- return platform-standard responses;
- keep route behavior overrideable by later modules.

## Extension Contract

Project modules may add or replace controllers through layered modules. New or
changed controllers must document the route contract, facade dependency,
security expectation, tenant/request context behavior, and tests for positive,
negative, access-control, and override scenarios.

## Capability

`nController` provides:

- generated controller templates for schema CRUD routes;
- generated controller artifacts under `src/controller/gen`;
- specialized controllers for cache, log, ping, validator, and interceptor behavior;
- request mapping from HTTP params, headers, query, and body into Nodics request objects;
- callback and promise-style controller execution support;
- utility, enum, and status extension slots;
- focused request-mapping tests.

Generated controllers translate route input into facade calls. They should not own business logic or persistence details.

## Runtime Flow

1. A router definition selects a controller and operation.
2. The controller reads `request.httpRequest` params, headers, body, and query.
3. The controller normalizes request fields such as `query`, `model`, `models`, `ids`, `codes`, `options`, or `searchOptions`.
4. The controller delegates to the owning facade.
5. The facade/service/pipeline layers own business behavior and data mutation.
6. The controller returns the promise result or invokes the callback used by the router runtime.

## Extension Path

Project modules may contribute controller overrides under `src/controller`. Use this layer when the change is about request mapping or transport adaptation. Put orchestration in facades and business behavior in services.

When adding a controller:

- document the route contract;
- preserve tenant, enterprise, auth, and correlation context;
- validate required params before delegation;
- return standard Nodics response/error envelopes;
- add route/controller request-mapping tests;
- update generated context after changes.

## Tests

Run:

```bash
node gFramework/nController/test/logControllerRequestMapping.test.js
npm run quality:docs
```

Generated controller behavior is also exercised by generated API and CRUD tests in the owning schema modules.

## What To Avoid

Avoid:

- placing business rules in controllers;
- bypassing facades to call database/provider APIs directly;
- losing tenant, enterprise, auth, or trace context during request mapping;
- accepting arbitrary operation names from request payloads;
- editing generated controllers manually when schema definitions should be regenerated.
