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
- `remote` is an internal, disabled-by-default adapter lifecycle. Sources and
  transports are keyed layered configuration entries. Requests select a source
  name rather than supplying arbitrary URLs or credentials. The framework
  enforces tenant/module allowlists, timeouts, bounded retries, isolated
  server-owned staging, path and symlink safety, file-count and byte limits,
  non-executable extensions, SHA-256 integrity, cleanup, and sanitized run
  diagnostics.

Remote adapters may stage data files only. Import headers always come from the
selected active modules (`init`, `core`, or `sample`) so remote input cannot
introduce executable schema or routing definitions. Projects must provide and
qualify a production adapter in their own module layer before enabling a source.
No public remote-import route is advertised by the framework yet.

## Data Feeding Patterns

The import module supports two production ingestion patterns through the same
governed lifecycle.

Push-based import lets an external system call a Nodics import API and send the
payload or approved input reference. The external system owns the trigger
timing, while Nodics owns route permission, tenant resolution, header
validation, file or payload processing, pipeline execution, diagnostics,
persistence, events, search indexing, and import history.

Scheduled file import lets an external system or business process place files
in a configured Nodics import location. A CronJob or other governed trigger
invokes the import service for pending files. This supports JSON, JavaScript
data definitions, Excel, CSV, and any additional file processors contributed
through the module hierarchy.

Direct remote pull through remote import adapters stages files from SFTP,
object storage, partner APIs, HTTPS pulls, enterprise file gateways, or similar
external locations before the normal import pipeline runs. A project or
provider module must own and qualify the production adapter before this path is
exposed.

Both patterns must use the same import pipeline and diagnostics model. Do not
add a direct persistence path for one source just because its data arrives by
API, file drop, CronJob, or remote adapter.

## Production Remote Adapter Gate

The framework remote import contract is implemented and tested, but production
remote pull remains gated by design. A project or provider module must own the
actual adapter, because SFTP, object storage, HTTPS pulls, partner APIs, and
enterprise file gateways each have different authentication, retry, timeout,
audit, and failure behavior.

A production adapter must:

- register its source and transport through layered `config/properties.js`;
- keep endpoints, credentials, tokens, and secret paths out of request payloads
  and source-controlled files;
- expose a loader-visible adapter service with a `stage(context)` function;
- stage only data files under the assigned server-owned staging directory;
- return file descriptors with SHA-256 checksums when checksums are required;
- respect configured tenant and module allowlists;
- obey timeout, retry, file-count, byte-limit, extension, checksum, and cleanup
  policy;
- write sanitized diagnostics to import run history;
- include deterministic contract tests and guarded live integration or release
  tests before any public route exposes that source.

Do not add a generic production remote adapter to the framework only to make the
route public. The capability is sacred; the implementation belongs to the
project or provider layer that owns the external source contract.

Generated/finalized files and reports are owned by the selected server module.
Validation-only mode can inspect headers, files, target schemas/services, and
processors without persistence.

## Import Governance

Import governance is recorded through the existing import run diagnostics and
history path. Each run may carry an aggregate checksum, deterministic
fingerprint, retry metadata, duplicate-run lookup result, and rollback hook
evidence. Duplicate protection skips history persistence only when a completed
or validated run with the same fingerprint already exists.

Retry metadata is advisory. The framework records attempt/max-attempt state so
project or provider-specific orchestration can decide whether to reschedule the
same import. Rollback hooks run only for failed finalization and are reported on
`importRun.rollback`; they do not create a second import execution path.
