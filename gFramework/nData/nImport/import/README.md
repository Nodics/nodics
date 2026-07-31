# import

The `import` module owns Nodics init, core, sample, local, and remote import
initialization; multi-format finalization; tenant-safe dispatch; diagnostics;
history; validation-only execution; and access-policy enforcement.

It also owns disabled-by-default, versioned content-pack installation and
updates. See Governed Content-Pack Import (canonical documentation: `capability.data-exchange.technical-reference`)
for the local `nodicsdocs` workspace, Axis administrator journey, configuration,
security, update, extension and verification contracts.

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

## Axis File Upload And Media-backed Import

Axis and other browser clients must not send raw local filesystem paths, cloud
object keys, NAS paths, or provider URLs to the import module. Browser-facing
file import is composed from existing Nodics capabilities:

1. The user selects the target enterprise in Axis.
2. Axis resolves the technical tenant from that enterprise and lets the user
   choose an authorized target model.
3. Axis uploads the selected file through the secured nMedia upload route.
4. nMedia validates upload policy, stores the file with the active provider,
   creates the media record, and returns only the governed `mediaCode`.
5. Axis starts the media-backed import route with the selected target model and
   `mediaCode`.
6. nImport asks nMedia for a backend-only import source descriptor, stages the
   file into an import-run workspace, and invokes the existing import pipeline.
7. Validation results, row-level correction guidance, install results, and run
   history remain owned by nImport.

This is the import-side equivalent of reusing the router file-download handler:
no parallel upload table, browser path, or module-specific raw file intake
should be added for imports.

The Back Office file-import journey must compose `nMedia` and `nImport`
instead of making Axis or a project module own raw uploaded files.

For a business user, the intended experience is simple:

1. Open the Import area in Axis.
2. Choose the kind of import, such as tenant data, product feed, price list, or
   catalog enrichment.
3. Upload a CSV, JSON, Excel, or other supported file.
4. Review validation results before installation.
5. Run the import.
6. Read the import history, rejected rows, counts, duration, and recovery
   guidance.

Behind that simple journey, Nodics keeps strict authority boundaries:

1. Axis uploads the file to `nMedia` using `folderCode=importSources` and
   `formatCode=importFile`.
2. `nMedia` validates the upload request, file size, MIME type, extension,
   folder policy, generated storage key, checksum, and media metadata.
3. Axis receives a media identity such as `mediaCode`. It does not receive a
   server filesystem path, cloud object key, NAS path, bucket name, provider
   credential, or authoritative URL.
4. Axis calls the secured `POST /nodics/import/v0/media` contract with
   `mediaCode`, the selected backend `moduleName` and `schemaName`, and
   optional validation mode. It may send a future `definitionCode` only when an
   nImport-owned reusable template is intentionally selected.
5. `DefaultMediaImportDefinitionService` builds a runtime generic definition
   from the selected module/schema target, or loads the optional active
   persisted `importDefinition`, validates tenant and file-extension policy,
   and creates a run-local header from that backend-owned target.
6. `DefaultMediaImportSourceStagingService` asks `nMedia` for a trusted backend
   descriptor for that media item.
7. `DefaultMediaImportSourceStagingService` creates import-run-owned staging
   and copies the media into the existing file import structure.
8. The standard import initializer loads trusted headers from active modules,
   parses the staged data file, finalizes records, dispatches through schema or
   search services, and records diagnostics.

The important rule is that upload and import are two separate backend
authorities. `nMedia` owns file storage. `nImport` owns import execution. Axis
owns only the employee workflow and rendering.

### Why Axis must not send paths

It is tempting to upload a file somewhere and call local import with:

```json
{
  "inputPath": {
    "rootPath": "/tmp/some-upload-folder"
  }
}
```

That is acceptable only for trusted backend-local operations where the caller is
already inside server authority. It is not acceptable as a browser-facing
Back Office pattern. A browser-supplied path can be wrong, malicious,
environment-specific, impossible to use in a cluster, or tied to one node's
temporary disk. It also bypasses the provider and lifecycle policy that
`nMedia` exists to enforce.

For Axis, the normal safe request shape is reference-based and schema-first:

```json
{
  "mediaCode": "supplier-price-list-2026-07",
  "moduleName": "catalog",
  "schemaName": "price",
  "operation": "saveAll",
  "options": {
    "validateOnly": true
  }
}
```

A future project may add an optional reusable template for recurring feeds. In
that case `definitionCode` is a convenience over the same nImport authority, not
the primary file-import decision:

```json
{
  "mediaCode": "supplier-price-list-2026-07",
  "definitionCode": "supplierPriceImport",
  "options": {
    "validateOnly": true
  }
}
```

When the business user is ready to install the same validated source, Axis calls
the same route with validation disabled:

```json
{
  "mediaCode": "supplier-price-list-2026-07",
  "moduleName": "catalog",
  "schemaName": "price",
  "operation": "saveAll",
  "importFinalizeData": true
}
```

The implemented secured route is:

```text
POST /nodics/import/v0/media
Authorization: Bearer <employee-token>
Content-Type: application/json
x-enterprise-code: <enterprise-code>
```

`DefaultMediaImportDefinitionService` owns definition lookup and header
materialization. `DefaultMediaImportSourceStagingService.stage(request)` owns
media staging. The staging service accepts `source.type=MEDIA` and
`source.mediaCode`, calls `DefaultMediaImportSourceResolverService` in
`nMedia`, creates a run-owned `data/`, `success/`, and `error/` workspace,
verifies checksum when the media record provides one, and returns a normal
`inputPath` shape for import execution without exposing the original media
provider path.

Validation-only mode resolves the media, validates the generic module/schema
target or optional template, validates the file extension and tenant scope,
stages the file, and runs the same local initializer used by execution mode.
This proves the selected file can be read, parsed, and finalized into the
import-run workspace. The run is recorded as `VALIDATED`, and the summary can
report records read and finalized. It must stop before
`processDataImportPipeline`, so it must not write target schema/search records
or report installation as complete. Execution mode uses the same prepared
workspace and then runs the existing finalized-data dispatch pipeline.

### Cluster and production behavior

In a clustered runtime, the node that receives the upload may not be the node
that executes the import. This is why media-backed import must use provider
storage and import-run staging rather than node-local browser paths.

The media-backed import resolver must:

- verify the authenticated employee has import permission;
- verify the media item exists, is active, and belongs to an import-capable
  folder such as `importSources`;
- resolve the selected generic module/schema target, or resolve an optional
  future template by `definitionCode`;
- reject public delivery URLs as import authority;
- use `nMedia` provider behavior to read or stage the file safely;
- create a server-owned import-run workspace;
- validate size, checksum, selected target, tenant scope, and active-module
  authority;
- run the existing local import pipeline after staging;
- record the source media code and safe diagnostics in import run history;
- avoid leaking provider paths, object keys, signed URLs, credentials, or local
  absolute paths to Axis.

### Customization path

Partners customize file import by adding project-owned headers, processors,
optional templates, and provider configuration. They should not copy framework
import services or create a second file-upload table.

Safe customizations include:

- adding a project header under the project module's `data/init`, `data/core`,
  or `data/sample` folders;
- adding a project-owned import template that maps a specific recurring
  business feed after the generic schema-first import is working;
- overriding allowed extensions or maximum file sizes in layered
  `properties.js`;
- adding a new media storage provider behind the `nMedia` provider contract;
- adding a remote import adapter for SFTP, object storage, partner API, or file
  gateway source;
- adding validation, enrichment, or mapping processors through the import
  pipeline.

Unsafe customizations include:

- making Axis upload directly to the server filesystem, S3, NAS, or a database
  blob table;
- sending raw local paths from a browser;
- bypassing `nImport` and writing records directly from an upload controller;
- parsing import data inside `nMedia`;
- storing media provider details inside Product, CMS, BackOffice, or project
  business models.

## Multi-format examples

The import module keeps committed processor fixtures in
`test/fixtures/multi-format` for the built-in file formats:

- trusted module-owned JavaScript data definitions;
- JSON arrays;
- CSV tabular records;
- Excel workbooks.

`multiFormatDataProcessors.test.js` reads those fixture files directly. This
protects the end-to-end parser contract and gives developers concrete examples
without making the examples part of runtime bootstrap. If a project needs a
real supplier, ERP, PIM, CMS, or partner file import, create project-owned
headers, mapping, source configuration, adapter or local-file trigger, and
tests through the existing import lifecycle instead of copying these fixtures
into framework startup data.

`gCore/profile/data/sample/tenant` restores the older Profile tenant local-file
import example as module-owned sample data. It uses the standard
`headers/` and `data/` structure: CSV, XLSX, and legacy XLS headers live under
one `headers/` folder and their files live under one `data/` folder. Each header
uses its own `dataFilePrefix` (`defaultTenantCsvData`,
`defaultTenantExcelData`, or `defaultTenantLegacyExcelData`) so the import
engine can safely match same-capability files without per-format folders. The
legacy `.xls` file is kept as historical reference only; the current validated
spreadsheet path is `.xlsx`.

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
  tenant: "default",
  modules: ["profile", "catalog"],
  remoteImport: {
    source: "supplierCatalog",
  },
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
          path: "products.csv",
          sha256: "<lowercase sha256 checksum>",
        },
      ],
    });
  },
};
```

Do not add a generic production remote adapter to the framework only to make the
route public. The capability is sacred; the implementation belongs to the
project or provider layer that owns the external source contract.

Generated/finalized files and reports are owned by the selected server module.
Data-release preflight validates the immutable manifest, requested version,
upgrade policy, active-module authority, tenant context, and installed state
without invoking import handlers. Only execute/install operations call the
init, core, or sample import pipeline. Lower-level validation-only import
processing remains available inside provider-owned import flows, but the
BackOffice data-release validate action must remain side-effect-free.

## Import Governance

Import governance is recorded through the existing import run diagnostics and
history path. Each run may carry an aggregate checksum, deterministic
fingerprint, retry metadata, duplicate-run lookup result, and rollback hook
evidence. Duplicate protection skips history persistence only when a completed
or validated run with the same fingerprint already exists.

Operator tools may query run history with `mediaCode` to inspect runs that used
a media-backed source. The filter is converted to the sanitized source name
`media:{mediaCode}` and remains read-only. This gives Axis Media Management a
safe way to show import linkage for a selected media record without exposing
provider paths or mutating import state.

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
