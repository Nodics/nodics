# nCommon

`nCommon` owns shared utilities, enumerations, reusable runtime helpers, and
common process/data holders used across Nodics modules.

`nCommon` is the place for utility middleware, enumerations, and common
class/process holders. Keep it focused: shared helpers belong here only when
they are framework-wide, stable, and not owned more clearly by a specific
capability module.

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
