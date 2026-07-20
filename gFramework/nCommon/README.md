# nCommon

`nCommon` is the shared toolbox used by several Nodics capabilities. It contains
small platform-wide building blocks that would otherwise be copied between
modules. It is deliberately not a home for any code that merely feels reusable.

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

## When To Use This Module

Use `nCommon` when a deterministic helper, error/status contract, processor,
interceptor primitive, or traceability mechanism is genuinely shared across
several framework capabilities. Keep the behavior in its existing capability
module when it expresses business meaning, provider behavior, persistence,
routing, identity, jobs, or workflow.

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

## Integration And Data Contracts

`nCommon` is widely consumed, so even a small change can affect startup,
requests, pipelines, imports, jobs, events, and tests. Public helpers must have
stable input/output and error behavior. Request, tenant, module, correlation,
and execution context should be passed explicitly rather than recovered from an
unexplained global.

Shared status definitions provide traceable error identities. Capability-owned
errors should remain in the capability module and use common formatting and
trace propagation rather than moving all error meaning into `nCommon`.

## Security, Performance, And Operations

- Never place credentials or secret-bearing convenience helpers in common
  logging or serialization paths.
- Prefer deterministic, low-overhead utilities because shared helpers can sit
  on high-volume paths.
- Preserve original error cause, correlation, module, tenant, execution layer,
  and safe diagnostic context.
- Avoid hidden I/O, network calls, mutable global state, or provider selection
  in a function presented as a general utility.

## Verification

```bash
node gFramework/nCommon/test/errorTraceability.test.js
node gFramework/nCommon/test/executionLayerTraceability.test.js
npm run quality:docs
npm run test:basic
```

Add focused positive, invalid-input, boundary, error-propagation, and consumer
regression tests when a shared contract changes.

## Common Mistakes

- Moving code here only to shorten an import path.
- Creating a second utility or status registry.
- Returning ambiguous error objects that lose the original cause.
- Reading tenant or request state from an implicit global.
- Adding a capability-specific enum as a framework-wide contract.

## Continue

- Error and trace terminology: [Nodics Glossary](../../gDocs/reference/glossary.md)
- Framework map: [gFramework](../README.md)
- Ordered execution: [nPipeline](../nPipeline/README.md)
- Public documentation: [Nodics Documentation](../../gDocs/README.md)
