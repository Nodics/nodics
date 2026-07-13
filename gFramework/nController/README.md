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
