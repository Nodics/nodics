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
- `remote` is an implemented, disabled-by-default adapter lifecycle. Sources and
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

Remote import adapters stage files from SFTP,
object storage, partner APIs, HTTPS pulls, enterprise file gateways, or similar
external locations before the normal import pipeline runs. A project or
provider module must own and qualify the production adapter before this path is
exposed.

Both patterns must use the same import pipeline and diagnostics model. Do not
add a direct persistence path for one source just because its data arrives by
API, file drop, CronJob, or remote adapter.

## Production Remote Adapter Gate

The framework remote import contract is implemented and tested. Production
remote import is enabled only through a project or provider module that owns the
actual adapter, because SFTP, object storage, HTTPS pulls, partner APIs, and
enterprise file gateways each have different authentication, retry, timeout,
audit, and failure behavior.

Remote import exists for the Nodics data hub pattern: external systems can
publish files to their own governed location, and Nodics can stage those files
before running the same import lifecycle used by module-owned files. This lets
business teams import supplier catalogs, ERP extracts, partner feeds, reference
data, or search-index payloads without giving the external source direct write
access to Nodics persistence services.

The runtime flow is:

1. A CronJob, service, facade, or governed project route calls
   `DefaultImportService.importRemoteData(request)`.
2. `remoteDataImportInitializerPipeline` validates the active tenant, requested
   active modules, configured source, transport, and adapter.
3. `DefaultRemoteImportTransportService.stage(request)` gives the adapter an
   assigned server-owned staging path.
4. The adapter copies or downloads files into that path and returns relative
   file descriptors with checksums.
5. Nodics rejects unsafe staging output, including files outside the assigned
   path, symlinks, disallowed extensions, oversized files, excess file counts,
   excess total bytes, missing checksums, or checksum mismatches.
6. `DefaultRemoteDataImportInitializerService.loadHeaderFileList` loads trusted
   headers from active modules using the configured `headerDataType`.
7. The standard data import initializer parses and finalizes staged files.
8. Unless `importFinalizeData` is `false`, finalized records are processed
   through `processDataImportPipeline` and dispatched to schema or search
   target services.
9. Import run history records sanitized source, transport, attempts, file
   counts, byte totals, diagnostics, success, or failure.
10. The isolated staging folder is cleaned up when effective policy allows it.

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

The minimum source configuration belongs in layered `config/properties.js`:

```js
data: {
    remoteImport: {
        enabled: true,
        defaultTransport: 'partnerSftp',
        defaultHeaderDataType: 'core',
        cleanupStaging: true,
        policy: {
            timeoutMs: 30000,
            retries: 1,
            maxFiles: 100,
            maxFileBytes: 10485760,
            maxTotalBytes: 104857600,
            allowedExtensions: ['json', 'csv', 'xlsx'],
            requireChecksums: true
        },
        transports: {
            partnerSftp: {
                enabled: true,
                service: 'DefaultPartnerSftpImportAdapterService'
            }
        },
        sources: {
            supplierCatalog: {
                enabled: true,
                transport: 'partnerSftp',
                tenants: ['default'],
                modules: ['profile', 'catalog'],
                headerDataType: 'core'
            }
        }
    }
}
```

The request selects the source. It does not carry credentials or external
connection details:

```js
SERVICE.DefaultImportService.importRemoteData({
    tenant: 'default',
    modules: ['profile', 'catalog'],
    remoteImport: {
        source: 'supplierCatalog'
    }
});
```

The adapter service must follow Nodics service export style and stage only
files under the assigned target path:

```js
module.exports = {
    stage: function (context) {
        return Promise.resolve({
            rootPath: context.targetPath,
            files: [
                {
                    path: 'products.csv',
                    sha256: '<lowercase sha256 checksum>'
                }
            ]
        });
    }
};
```

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

## Recursive Error Propagation

Import uses recursive processing for header files, data files, tenants, records,
relation macros, and multi-file format readers. Recursive import processing must
always do one of two things:

- continue to the next pending item when the current item is safely skipped;
- reject with a concrete `DataImportError` or enriched Nodics error when the
  current item fails.

A skipped, already processed, or failed record must not stop later records in
the same batch. Successful records are marked in the file-level `processed`
list. Failed records are not marked processed, so a later phase or later run can
retry them after the source problem is corrected. The file-level `done` flag may
be set only after the file pipeline succeeds; any collected record failure keeps
the file out of the success path.

The `data.stopImportOnFailure` property controls failure mode:

- `false` is the default data-feed mode. Nodics attempts the remaining records,
  records each failure in import diagnostics, leaves failed records unprocessed
  for retry, and returns an aggregate import error after the batch is attempted.
- `true` is fail-fast mode. Nodics stops at the first record failure and returns
  that failure immediately.

The `data.batchImport` property controls finalized-record dispatch size:

- `enabled: false` is the default compatibility mode. Nodics dispatches one
  record at a time through `processModelImportPipeline`.
- `enabled: true` dispatches unprocessed finalized records in batches of
  `size`. A header may override this through `header.options.batchImport` when
  a specific data feed needs different throughput behavior.

Batch import is a dispatch optimization, not a second persistence path. Every
batch still runs through `processModelImportPipeline`, schema/search target
routing, import access policy, relation macro resolution, target services,
diagnostics, and import history. A successful batch marks every record in that
batch as processed. A failed batch records failure diagnostics against every
record in the batch, leaves those records unprocessed, and either continues or
stops according to `data.stopImportOnFailure`.

Provider-native bulk insert or bulk indexing may be added later behind the same
target service contract. Do not bypass schema services, search services,
interceptors, validators, tenant scope, or access policies to improve import
speed.

Aggregated recursive failures must pass a real error object into the pipeline
error terminal so diagnostics, import run history, and failure traceability
receive usable context.

Malformed parser input, such as invalid JSON, is a hard import failure. It must
not advance the data handler pipeline or be treated as an empty file.

## Target Dispatch

Every import header must declare exactly where finalized models go. The target
is selected from trusted active-module header definitions, not from arbitrary
caller input.

Use `header.options.schemaName` when the import writes to the database through a
generated schema service. The model import process resolves:

- service: `Default<SchemaName>Service`;
- operation: `header.options.operation`, usually `saveAll`;
- tenant: the resolved import tenant;
- authorization context: `header.options.userGroups`;
- query: `header.query`;
- payload: `models`.

This keeps database import under the same generated service, DAO, validation,
interceptor, access-policy, and tenant contracts as normal CRUD behavior.

Use `header.options.indexName` when the import writes to a search index. The
model import process resolves:

- service: `Default<IndexName>Service` when available, otherwise
  `DefaultSearchService`;
- operation: `header.options.operation`, usually a search save operation;
- tenant: the resolved import tenant;
- index/module: `header.options.indexName` and `header.options.moduleName`;
- authorization context: `header.options.userGroups`;
- query: `header.query`;
- payload: both `models` and the compatibility `model` value for services that
  still process one record at a time.

Search import treats provider errors as import errors and preserves multi-record
payloads. A normal search response may return an object, array, or single-result
shape through `result`; it does not need to return more than one result to be
accepted.

Do not add a second import target path for a specific database, search engine,
file source, or customer project. Add or override the service, operation,
processor, interceptor, validator, or header in the owning module layer.

## Header Contract

A data import header describes the import target and processing behavior. Common
fields include:

- `options.moduleName`: owning module for the target schema or index;
- `options.schemaName`: database/schema target;
- `options.indexName`: search/index target;
- `options.operation`: service method invoked for the target;
- `options.userGroups`: authorization groups used by the import execution;
- `options.tenants`: explicit tenant scope, when the header is tenant-specific;
- `options.dataHandler`: pipeline used after file parsing;
- `options.processPipeline`: optional model-level processing pipeline;
- `options.processors`: named processors used by the data handler;
- `options.finalizeData`: whether finalized output files are written;
- `options.stopImportOnFailure`: optional header-level fail-fast override;
- `options.batchImport`: optional header-level batch dispatch override;
- `query`: target query/context passed to the service operation;
- `macros`: relation-resolution rules for schema imports.

Headers are source definitions. Projects customize import behavior by adding or
overriding headers and services in later active modules, then proving the
effective behavior with import tests.
