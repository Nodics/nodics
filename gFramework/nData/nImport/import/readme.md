# import

The `import` module owns Nodics init, core, sample, local, and remote import
initialization; multi-format finalization; tenant-safe dispatch; diagnostics;
history; validation-only execution; and access-policy enforcement.

## Tenant precedence

Import tenant resolution uses intersection semantics:

1. An import header may declare `options.tenants`.
2. Without an explicit header tenant list, the header is eligible for active
   tenants.
3. A trusted request-level tenant narrows that eligible set to one tenant.
4. A request tenant never broadens or redirects the header tenant set.
5. When request and header scopes do not intersect, that header dispatches no
   records and the exclusion is recorded in import diagnostics.
6. An inactive explicit request tenant fails before record dispatch.

This allows default-only bootstrap headers to be skipped safely during another
tenant's initialization without contaminating either tenant.

## Bootstrap boundaries

Framework startup imports mandatory init data into the configured default
tenant when `NODICS.isInitRequired()` is true. Default enterprise and tenant
catalog headers are explicitly scoped to `default`.

When the enterprise handler initializes another active tenant, it invokes the
same layered init capability with that tenant. Default-only headers are
excluded, while unscoped module-owned headers may initialize tenant-specific
groups, service principals, workflows, validators, catalogs, or project data.

Projects extend bootstrap behavior by contributing `data/init` headers and
data in later active modules. They must not edit framework data files.

## Import types

- `init`, `core`, and `sample` discover data from selected active modules.
- Environment, server, and node modules may contribute sample/init data through
  the same module-owned directories and active-module ordering.
- `local` processes an explicitly provided local input structure.
- `remote` currently provides an internal initializer extension point. A
  project must supply a governed transport/file adapter before exposing it as a
  public API; Nodics does not advertise a built-in production remote transport.

Generated/finalized files and reports are owned by the selected server module.
Validation-only mode can inspect headers, files, target schemas/services, and
processors without persistence.
