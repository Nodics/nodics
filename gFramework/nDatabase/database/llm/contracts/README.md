# database AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nDatabase/database`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Transaction contract

- Use `DefaultDatabaseTransactionService`, never a driver session in business code.
- Pass the opaque context unchanged through generated service requests.
- Keep all records in the same resolved module/tenant database.
- Fail closed when `multiRecordAtomic` is absent.
- Prove commit, abort, expired context, wrong database, concurrency conflict,
  and live-provider topology before activation.

## Reference-integrity contract

- The source schema's effective `refSchema` is the relationship authority.
- Use `onTargetDelete: 'RESTRICT'` to prevent deletion of a referenced target.
- Enforce the rule in the shared generated remove lifecycle, never in Axis or
  a Workbench-only persistence path.
- Fail closed when an explicitly declared source cannot be validated.
- Preserve tenant context and configured relationship/record bounds.
- Keep conflict responses client-safe; never expose database queries, records,
  tokens, credentials, contexts, or stacks.
- A distributed replacement may use remote checks or a governed reference
  index, but must not become a separately managed relationship authority.
- Do not implement cascade implicitly. Use a module-owned business operation
  with explicit transaction or compensation semantics.

## Schema Workbench discovery contract

- Discover every eligible effective model with generated Search, Read, Create,
  Update, and Delete by default.
- Continue filtering descriptors through schema access groups and employee
  authorization.
- Exclude non-model schemas and models declaring `backoffice.enabled: false`.
- Use explicit per-schema operations to narrow models that must be read-only.
- Project only safe fields; never expose secrets, access policy internals,
  service configuration, database configuration, interceptors, or validators.
- Keep bulk operations disabled unless `backoffice.bulkOperations` explicitly
  enables a supported operation.
- Require the manage permission, configured item bound, and valid idempotency
  key for every generic bulk mutation; execute through generated CRUD.
- Derive delete impact from effective inbound `RESTRICT` relationships and
  fail closed when a declared source cannot be inspected.
- Advertise concurrency only from an effective revision field. Never infer it
  from timestamps or browser state.
- Keep aggregate service/method names private. The generic endpoint delegates
  to an owning module service and never becomes a second unit-of-work engine.
- Use `DefaultDatabaseTransactionService` for supported same-database atomic
  work and an owning Workflow or saga for cross-module consistency.

## Named schema-policy composition

- Reusable access/ownership defaults live in layered `schemaPolicies`.
- Namespace policies under the schema-owning module.
- Schemas reference stable policy names through `schemaPolicies`.
- Materialize policies before inheritance; final `accessGroups` and
  `ownership` remain the only runtime enforcement contract.
- Use keyed booleans for ownership collections: `true` includes and `false`
  removes an inherited entry.
- Reject unknown policy names and never call policy configuration directly
  from CRUD, authorization, ownership, Workbench, or frontend code.
