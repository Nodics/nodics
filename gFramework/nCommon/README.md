# nCommon

`nCommon` owns shared utilities, enumerations, reusable runtime helpers, and
common process/data holders used across Nodics modules.

`nCommon` is the place for utility middleware, enumerations, and common
class/process holders. Keep it focused: shared helpers belong here only when
they are framework-wide, stable, and not owned more clearly by a specific
capability module.

`nCommon` does not own startup hierarchy resolution or configuration loading.
Those responsibilities belong to `nConfig`. `nCommon` contributes shared
runtime primitives after `nConfig` has prepared the active module hierarchy and
effective layered configuration.

## Ownership

`nCommon` may own:

- reusable utility functions used across framework modules;
- common enumeration definitions;
- shared constants and helper contracts;
- cross-cutting runtime helpers that do not belong to a more specific module;
- documentation of safe utility extension patterns.

Capability-specific logic belongs in the owning capability module, not here.

## Extension Contract

Later modules may extend or override common behavior only through established
module hierarchy and source definitions. Do not monkey-patch globals or create
parallel utility registries.

When adding a shared helper, document:

- the owning use case;
- inputs and outputs;
- side effects;
- tenant/request context expectations;
- error behavior;
- why the helper belongs in `nCommon` instead of a capability module.

## Developer Guidance

Prefer small, deterministic helpers. Avoid hidden dependency on active project,
environment, server, node, tenant, or request state unless that context is
explicitly passed in or resolved by an existing Nodics service.

## Utility Middleware

Utility middleware provides shared functions available across the application. Shared helpers remain explicit,
documented, and owned.

Use `nCommon` for helpers that are:

- reused by several framework modules;
- stable enough to become a platform contract;
- deterministic or explicit about side effects;
- not better owned by a capability module.

Do not move a helper into `nCommon` only to make it easy to import. Shared code
creates a shared contract, so it needs stronger documentation and tests.

## Enumerations And Status Definitions

Common enum or status definitions describe platform-wide values that are
safe to reuse across modules. Capability-specific enums and statuses
stay in the owning module's `src/utils/enums.js` or
`src/utils/statusDefinitions.js`.

When adding shared enum/status values, document:

- consumer modules;
- default meaning;
- whether projects may extend or override the value;
- backward-compatibility impact;
- tests or generated context that prove the value is visible.

## Common Process Boundaries

`nCommon` may provide low-level process helpers, but it must not own business
process definitions, workflow definitions, job lifecycle behavior, or startup
hierarchy. Those belong to `nPipeline`, workflow, cronjob, `nConfig`, or the
specific capability module.

If a helper needs tenant, request, module, or runtime-governance context, pass
that context explicitly or call an existing service. Hidden global assumptions
make later project overrides difficult to reason about.
