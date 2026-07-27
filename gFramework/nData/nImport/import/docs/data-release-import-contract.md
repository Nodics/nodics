# Init, Core, and Sample Data Releases

## Purpose and ownership

Nodics separates three data lifecycles. **Initialization data** establishes
security-sensitive bootstrap identities and records required by dependent
capabilities. **Core data** establishes governed baseline configuration and
business records. **Sample data** supplies optional demonstrations for
explicitly permitted non-production environments.

The `import` module owns discovery, integrity checks, validation, execution,
installation state, and history. BackOffice advertises navigation and Axis
presents the operator experience. Neither reads module data folders, orders
files, writes models, or creates a second importer.

The owning `import` capability is router-enabled and registers its authorized
endpoint with BackOffice. Axis resolves that registered module connection; it
must not route these operations through System or BackOffice.

## Immutable release contract

Every module-owned `data/init`, `data/core`, or `data/sample` directory contains
`manifest.json` with the module, type, semantic version, description, and
SHA-256 checksum of every release file.

```bash
npm run data:manifests
npm run data:manifests -- --release profile:init=1.0.3
```

The first command creates missing manifests but rejects changed files under an
existing version. The second explicitly versions an intentional change. Nodics
rejects same-version checksum changes and rejects downgrades unless a project
has explicitly enabled governed downgrade policy.

## Operator workflow

1. Open **Operations and Integration → Imports and Exports** in Axis.
2. Select Initialization, Core, or Sample data.
3. Review backend-discovered active-module releases and installation states.
4. Select releases and choose **Validate selected**. This invokes the ordinary
   importer in validation-only mode without persisting business records.
5. Choose **Install or update selected** only after successful validation.
6. Review the import run and refreshed catalogue.
7. If permissions or navigation changed, sign out and sign in so Profile issues
   a new permission-filtered session.

States include `NOT_INSTALLED`, `CURRENT`, `UPDATE_AVAILABLE`, `RUNNING`,
`FAILED`, and integrity or downgrade warnings. Axis displays these states; it
does not calculate them.

## Configuration and extension

Defaults live under `data.dataReleases` in the import module. Environment or
server layers override only genuine runtime differences. Sample execution is
disabled by default and enabled for local development only.

Projects may layer `DefaultDataReleaseService`, but must preserve active-module
discovery, server-owned paths, path containment, checksums, semantic versions,
tenant isolation, existing model services, type-specific permissions, nImport
execution, and client-safe responses. Never add direct database access, another
filesystem loader, a browser import engine, or a parallel BackOffice authority.

## API and permission boundaries

- `GET /nodics/import/v0/data-releases` — `import.release.view`
- `POST /nodics/import/v0/data-releases/preflight` —
  `import.release.validate`
- `POST /nodics/import/v0/data-releases/init/imports` — `import.init.run`
- `POST /nodics/import/v0/data-releases/core/imports` — `import.core.run`
- `POST /nodics/import/v0/data-releases/sample/imports` —
  `import.sample.run`
- `GET /nodics/import/v0/run/history` — `import.history.view`
- `GET /nodics/import/v0/run/history/:runId` —
  `import.history.detail.view`

Fixed type-specific routes prevent the request body from switching to another
data class. Backend authorization remains authoritative when Axis hides an
action.

For existing installations, catalogue and preflight also accept the historical
`import.core.run` administrator permission. This bounded upgrade bridge prevents
the new read permission from hiding the operation required to install it.
Execution remains protected by fixed type-specific permissions. Projects must
not extend this compatibility rule to unrelated permissions.

## Failure, recovery, and verification

Missing, incompatible, symlinked, escaping, or checksum-invalid releases fail
before execution. A release changed after selection is rejected. A second
process-local run for the same tenant and type is rejected. Failed attempts do
not falsely mark a version installed. Responses never expose paths, secrets,
credentials, or stack traces.

The process-local execution lock supports the local reference runtime. A
distributed deployment must layer a project-approved provider-atomic lock
before enabling multiple executors for the same tenant and type.

Verify manifest governance, positive installation, validation-only behavior,
disabled sample policy, stale selection, checksum tampering, route permissions,
history authorization, normal schema import, integration, and regression
behavior. Run repository build and generated-context checks before release.
