# Governed Content-Pack Import

## Business overview

A content pack is a versioned set of Nodics import headers and data maintained
outside the framework repository. Configured packs currently include
`nodicsDocumentation`, supplied by `nodicsdocs`, and `axisDocumentation`,
supplied directly by the `nodicsaxis` repository. Importing a pack makes its
CMS documentation product available without copying its authored repository
into Nodics.

The capability is disabled by default. When an administrator enables it, Axis
can report whether documentation is absent, current, being imported, unavailable,
or has an update. Employees with view permission can see state. Only employees
with run permission can install or update it.

## Local workspace prerequisite

The local source resolver expects sibling repositories:

```text
nodicsRoot/
├── nodics/
├── nodicsaxis/
└── nodicsdocs/
```

Use pinned published repository revisions. `nodicsdocs` currently supplies
`manifest/generated-content-pack.json`; frontend/customer projects use the
standard `manifest/docs-content-pack.json`. Every repository commits its
`data/core` directory as a directly importable release artifact. An operator
does not install dependencies, run generation, or create a `.work` staging
directory.

Nodics validates every committed file's SHA-256 hash and the aggregate release
checksum. It then copies `data/core` into server-owned temporary staging.
Nodics never gives the moving local-import pipeline the source-controlled
directory, and clients never submit a filesystem path.

The import run is not complete merely because schema writes have been
dispatched. Every processed file must first reach its governed success
location. Only then may the run be marked complete and content-pack staging be
removed. An archival failure fails the run and preserves diagnostics instead
of reporting a false successful installation.

Server-owned staging cleanup occurs only after authoritative import completion.
If cleanup itself fails after every record and file has completed, Nodics logs
the cleanup failure for operations but does not convert an already successful
business import into a failed API response. Residual staging remains
server-owned and may be removed through operational housekeeping.

One import-run identity follows the release through header finalization,
finalized-file processing, and model dispatch. Therefore the persisted
diagnostics describe the complete operation: records read, finalized,
dispatched, succeeded, skipped, and failed all belong to the same run. A nested
pipeline must propagate this object rather than create an untraceable parallel
diagnostic path.

Import-run duplicate protection includes the content-pack code, immutable
version, and release checksum. Re-importing the same release remains
idempotent, while a valid later release cannot be mistaken for an earlier
completed run merely because both use the local import pipeline.

Installed-version resolution uses the persisted completion timestamps returned
by the schema-backed import-run service. It does not rely solely on a database
adapter honoring model-level sort options, so the latest completed release is
selected consistently across supported adapters.

## Enabling the pack

Override only the required property in a later project or environment
`properties.js`:

```js
module.exports = {
    data: {
        contentPacks: {
            enabled: true
        }
    }
};
```

The framework definition remains in
`gFramework/nData/nImport/import/config/properties.js`. Do not copy the service,
controller, facade, route, or import pipeline into a project module.

## Axis administrator journey

1. Sign in to Axis as an employee.
2. Open **Help and Documentation**.
3. Axis renders the permission-filtered documentation products from BackOffice
   bootstrap.
4. For a CMS product, Axis asks the registered System module for the selected
   source's configured pack status, such as `nodicsDocumentation` or
   `axisDocumentation`.
5. If it is not installed and the source is valid, select **Import
   documentation**.
6. Nodics verifies the configured source and release, creates isolated staging,
   and invokes the existing local import lifecycle.
7. After successful import, Axis opens the authenticated CMS product.
8. When a newer version is detected, Axis keeps the installed product usable and
   offers **Update documentation**.

The **Swaggers** product does not use a content pack. It renders the active
System Swagger/OpenAPI contract and remains governed by the runtime
`openApiContract` exposure policy.

If the feature is disabled, Axis shows setup guidance and no import action. If
the source is missing or invalid, it shows a safe recovery message. Internal
paths, checksums, stack traces, credentials, and import payloads are never
returned to Axis.

## Update rules

- Same version and same checksum: no-op.
- Newer version: import through the same staged local-import lifecycle.
- Same version with a different checksum: reject because the published release
  was changed in place.
- Older version: reject unless a later layer explicitly enables downgrades.
- Failed update: report failure and keep the Wiki route available for recovery.

Headers use stable record codes and `saveAll` queries by `code`, so new records
are created and changed records are updated rather than duplicated. Physical
removal and atomic catalog-version activation are not claimed by this first
contract; a later release must compose CMS catalog versioning, Workflow and
`nPublish` rather than adding deletion or publication logic to nImport.

Because this first local contract reuses the standard multi-record import
lifecycle, a failed update may have applied valid records before a later record
failed. Operators must review import-run diagnostics and retry the same
immutable release. Exact all-or-nothing content activation requires the later
CMS catalog-version and nPublish composition described above.

## API and security

System exposes the existing nImport capability:

```text
GET  /nodics/system/v0/content-packs/:packCode
POST /nodics/system/v0/content-packs/:packCode/imports
```

The routes require `import.contentPack.view` and
`import.contentPack.run`, respectively. Backend authorization is authoritative;
an Axis button is never authorization. Requests retain employee identity,
tenant context, correlation information and import-run history.

The import request has no source path body. Source selection is owned by
layered `data.contentPacks` configuration; allowing a browser or caller to
choose a server filesystem path would bypass the content-pack allowlist and
release-integrity contract.

## Extension and deployment

Later modules may override `DefaultContentPackService` to provide a governed
remote artifact source or distributed import lock. They must preserve manifest
validation, immutable versions, tenant scope, server-owned staging, sanitized
status, import history and dispatch through `DefaultImportService`.

Local sibling discovery is for local development. Cloud environments should
replace source resolution with an approved object-store, artifact repository or
other governed adapter. Secrets and absolute developer paths must not appear in
properties, request bodies, manifests or client responses.

## Verification

```bash
node gFramework/nData/nImport/import/test/contentPackService.test.js
node gFramework/nData/nImport/import/test/contentPackRouteContract.test.js
node gFramework/nData/nImport/import/test/importFileArchivalLifecycle.test.js
node gFramework/nData/nImport/import/test/importDiagnosticsPropagation.test.js
node gFramework/nSystem/test/systemRouteContract.test.js
```

The tests cover disabled, missing, valid, duplicate, update, downgrade,
source-integrity, staging-safety, permission-route and regression behavior.
