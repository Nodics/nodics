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
