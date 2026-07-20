# nPublish Documentation

This folder contains permanent human-readable documentation for the `gFramework/nPublish` module boundary.

## Executable lifecycle

`DefaultPublicationLifecycleService` owns the generic publication state machine.
The schema-owning domain contributes an adapter for validation, dependency
resolution, and post-activation hooks. A version provider owns immutable staged
version lookup, Online pointer activation, and rollback. The repository provider
owns tenant-isolated persistence, compare-and-set revisions, and immutable audit
entries.

The authoritative audit journal is embedded in each publication request and is
written atomically with lifecycle state and revision through the same
compare-and-set update. `publicationAudit` is a query-optimized projection. If
projection persistence is temporarily unavailable, the lifecycle result remains
auditable and the projection can be reconciled from the request journal.

`DefaultPublicationAuditReconciliationService.reconcile` performs that repair
for one tenant. Calls may target one publication or a configured bounded batch,
and return scanned, journal, missing, restored, failure, timeout, and duration
evidence. Replays and concurrent runs are safe because projection identities are
deterministic. The service never edits lifecycle state or journal entries.

Batch size and maximum execution duration are layered under
`publish.reconciliation`. Scheduling remains owned by `cronjob`; nPublish does
not create a second scheduler. A future administrative route must apply the
BackOffice administrative authorization boundary before invoking this service.

Every state-changing request carries `expectedRevision`. Concurrent requests
therefore fail before invoking activation providers. Replaying an already
Online activation or completed rollback returns the persisted result without
calling the provider again.

Validation evidence and audit details remove credential-like fields and enforce
configured collection and string bounds. Provider failures are recorded as a
governed `FAILED` transition when persistence remains available.

Publishing workflow `revision` is independent from database `versionId`.
Publication request and audit schemas are ordinary, non-versioned governance
records; domain-owned staged assets independently opt into versioned persistence.

Keep architecture, runtime contracts, configuration behavior, operational notes, troubleshooting, and extension decisions here when they are too detailed for the module `README.md`.

Update this folder whenever module behavior, public contracts, security posture, lifecycle, or customization rules change.

See the beginner and business-user guide at
[`gDocs/content/how-to-approve-and-publish-content.md`](../../../gDocs/content/how-to-approve-and-publish-content.md)
for the verified CMS implementation, two-system configuration, extension path,
operations guidance, and test commands.
