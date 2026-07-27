# Core Data Operations

## Purpose

Core data is the version-controlled baseline data contributed by active Nodics
modules. It can include permission groups, configuration records, catalog
records, and other module-owned defaults required by an environment.

Nodics Axis exposes **Administration > Core Data** only to employees whose
effective permissions include `import.core.run`. The page invokes the existing
nImport core-data API; BackOffice contributes only the permission-filtered
navigation entry and does not become another importer.

## Business operator workflow

1. Sign in to Nodics Axis with an authorized administrative employee account.
2. Open **Administration > Core Data**.
3. Review the warning explaining that the import may create or update baseline
   records.
4. Choose **Import or update core data** and confirm the operation.
5. Wait for the governed nImport result.
6. Sign out and sign in again when permissions or other session-derived policy
   changed. Existing access tokens are not silently elevated.

Core import is not a module-startup side effect. Operators run it explicitly
when installing an environment or after deployed core-data contributions
change.

## Ownership and security

- nImport owns discovery, validation, ordering, persistence, diagnostics, and
  the `/nodics/system/v0/import/core` operation.
- Owning modules continue to own their contributed records.
- BackOffice owns the navigation metadata only.
- Axis owns confirmation, progress, success, and safe error presentation only.
- The backend requires `import.core.run`; hiding the menu is not authorization.
- Axis sends the in-memory employee access token and enterprise context. It
  never stores the token or receives database credentials.

## Failure and recovery

An unauthorized request is rejected by the backend. A transport or import
failure remains visible without implying that all records were changed.
Operators should inspect the authoritative nImport run diagnostics before
retrying. Retrying uses the same core import authority and its duplicate and
idempotency protections.

## Customization

Projects extend core data through the existing layered module data contract.
They must not add a second frontend importer, write collections directly, or
copy framework-owned baseline records merely to expose them in Axis.
