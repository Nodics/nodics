# nFacade

`nFacade` owns the orchestration boundary between controllers and services.

Facades are generated or handwritten platform functions that prepare business
operations before delegating to services. Controllers map requests, facades own
workflow/policy orchestration, and services own business behavior.

## Ownership

Facades should:

- coordinate service calls;
- enforce capability-level orchestration policy;
- preserve request and tenant context;
- keep controllers thin;
- remain overrideable by later modules.

Do not put database details or raw transport behavior in facades unless the
owning service contract requires it.

## Extension Contract

Project modules may add or replace facades through the module hierarchy. New
facade behavior must document the service contracts it calls, request context
requirements, generated artifacts affected, and tests proving default and
override behavior.

## Capability

`nFacade` provides:

- generated facade templates for schema CRUD behavior;
- generated facade artifacts under `src/facade/gen`;
- specialized facades for API key, cache, log, validator, and interceptor behavior;
- orchestration boundaries between request controllers and business services;
- utility, enum, and status extension slots.

Generated facades delegate standard CRUD calls to generated services. Handwritten facades should coordinate service calls, enforce capability-level ordering, and keep controllers transport-focused.

## Runtime Flow

1. A controller maps transport input into a Nodics request object.
2. The controller calls a facade operation.
3. The facade coordinates one or more service calls.
4. Services own business behavior and data mutation.
5. The facade returns the service result to the controller.

Use facades when the behavior is orchestration across services or capability policy. Use services when the behavior is the actual business operation.

## Extension Path

Project modules may contribute facade overrides under `src/facade`. A facade override should preserve the route/controller contract unless the owning route and docs are changed together.

When adding a facade:

- document the services it calls;
- preserve tenant/request context;
- keep persistence/provider details in services;
- keep generated artifacts source-driven;
- add tests for orchestration, failure behavior, and later-module overrides.

## Tests

Run:

```bash
npm run quality:docs
npm run docs:coverage:source -- --limit=20
```

Generated facade behavior is primarily validated through generated API and CRUD tests in the owning schema modules.

## What To Avoid

Avoid:

- adding raw database or broker client logic to facades;
- duplicating service business rules in facades;
- mutating request context in surprising ways;
- bypassing services for generated schema behavior;
- editing generated facades manually instead of regenerating from source definitions.
