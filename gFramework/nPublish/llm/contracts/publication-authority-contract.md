# Publication Authority Contract

`nPublish` is the sole generic authority for Staged/Online lifecycle states,
transition validation, publication requests, publication audit, activation and
rollback orchestration. Domain modules contribute adapters; versioned database
variants contribute persistence; workflow contributes approval; event, cache,
and search modules consume completion hooks.

Never reproduce publication states, scheduling, audit, activation, or rollback
inside CMS, WCMS, catalog, commerce, or project modules. Domain fields such as
CMS pages belong in adapter payloads and dependency references, not generic
publication schemas.

Module adapters must not update generic publication state directly. They
provide `resolveDependencies`, `validate`, `afterActivate`, or `afterRollback`
hooks. Version providers supply `getVersion`, `getOnlineVersion`, `activate`,
and `rollback`. Repository providers preserve tenant isolation, optimistic
revision checks, idempotent creation, and immutable transition audits.

Version providers may be selected per domain through
`publish.providers.versionProviders`; the single `versionProvider` remains a
default only. Domain modules own their provider contribution and nPublish must
not embed domain-specific version or Online-pointer behavior.

The publication request owns the authoritative transition journal. Repository
providers must update lifecycle state, optimistic revision, and the new journal
entry in one compare-and-set write. The `publicationAudit` collection is a
query projection and may be reconciled from that journal; projection failure
must never discard authoritative audit evidence or roll lifecycle state forward
without evidence.

Projection reconciliation must read journals through the configured repository,
remain tenant-scoped and bounded, and insert only missing deterministic audit
identities. It must not modify publication state, revision, or journal entries.
Scheduling belongs to the existing cronjob authority, and any administrative API
must use the BackOffice administrative security boundary.

All lifecycle mutations require the caller's expected publication revision.
Activation and rollback providers must be idempotent because infrastructure can
fail after external work succeeds but before the local response is observed.
