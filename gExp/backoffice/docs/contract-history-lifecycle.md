# BackOffice Contract History and Approval Contract

## Purpose and authority

BackOffice retains bounded, normalized observations of module-owned effective
contracts so administrators can review compatibility changes without creating a
second contract authority. Target schemas, routers, permissions, OpenAPI, and
runtime behavior remain authoritative. A retained snapshot cannot edit or
deploy a target-module contract.

The immutable snapshot hash is the observation identity. The separate durable
activation record selects the current safe observation for a module and is the
concurrency authority across BackOffice replicas. Process-memory discovery
state is only a cache and is hydrated from that durable pointer after restart.

## Lifecycle

Every discovery is saved idempotently as one immutable normalized snapshot.
`INITIAL`, `UNCHANGED`, and `NON_BREAKING` observations activate automatically.
`POTENTIALLY_BREAKING` and `BREAKING` observations enter `PENDING_APPROVAL` and
cannot replace the current pointer without an explicit administrator decision.

Snapshot states are `DISCOVERED`, `ACTIVE`, `PENDING_APPROVAL`, `REJECTED`, and
`SUPERSEDED`. Pointer selection remains authoritative if a process stops between
the pointer compare-and-set and the denormalized snapshot-state update. Reads of
the current contract therefore resolve the pointer and then its immutable
snapshot.

Approval and rollback advance the pointer with optimistic compare-and-set using
the caller's expected activation revision. Rejection also verifies that
revision, preventing a stale review from deciding a candidate after another
administrator has changed the active contract. Every mutation requires a
bounded reason and records the authenticated principal and sanitized audit
metadata. A rejected snapshot cannot be a rollback target.

## API and authorization

The lifecycle API exposes current, bounded history, comparison, approval,
rejection, and rollback operations. Reads require
`backoffice.contract.view`. Mutations use distinct
`backoffice.contract.approve`, `backoffice.contract.reject`, and
`backoffice.contract.rollback` permissions. Runtime configuration viewers
receive read access; runtime configuration administrators receive decision
access. Target-module permissions and human authentication remain independent
and are never replaced by these permissions.

Module names and SHA-256 coordinates are validated before persistence access.
History limits are positive, bounded by layered configuration, and sorted newest
first. Responses contain normalized operations and schemas plus decision
metadata; they never contain raw source documents, credentials, tokens, private
topology, or executable UI content.

## Persistence, retention, and recovery

The two BackOffice-owned schemas use ordinary Nodics generated model services
and persistence pipelines. No custom database connection, loader, or parallel
repository authority is introduced. The operational tenant follows existing
request/default-tenant resolution.

Retention is configured per module. The active and pending snapshots are always
protected; only older inactive history is eligible for removal. Registration
and discovery remain asynchronous to module readiness. Persistence failure is
reported in discovery diagnostics and never causes a breaking observation to
replace the last durable safe pointer.

## Required validation

Changes to this contract require positive, negative, boundary, contract,
integration, and regression coverage. At minimum test deterministic snapshots,
safe automatic activation, pending breaking changes, authorization routes,
invalid coordinates and limits, stale and concurrent revisions, rejection,
rollback restrictions, bounded retention, repository restart recovery, and
modular runtime discovery with generated persistence services.
