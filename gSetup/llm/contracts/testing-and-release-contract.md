# Testing And Release Contract

Use proportionate validation while preserving enterprise reliability.

## Layer-Aware Test Contracts

Nodics tests are contracts for the layer they validate.

- Platform invariant tests must pass in every valid Nodics project. They prove
  shared runtime behavior such as module loading, request pipelines, auth,
  schema loading, DAO operations, import/export, cache, events, topology, and
  generated-test execution.
- Framework default module tests validate the out-of-the-box contract delivered
  by Nodics modules. They may assert default schema fields, default routes,
  default permissions, default data, and default scenarios.
- Effective project tests validate the active project contract after project,
  environment, server, node, tenant, customer, and runtime overrides are
  applied. They should reuse Nodics test engines and generators, but fixtures
  and assertions must come from the effective active schema/router/service
  contract, not from stale framework defaults.

If a default module schema contains properties `x`, `y`, and `z`, and a
customer project intentionally removes `z` through a later-layer schema
override, the project should not hand-edit the framework test or copy the whole
test suite. The project must regenerate or contribute project-owned tests that
use the effective schema containing `x` and `y`. The framework default test
continues to prove the default framework contract; the project effective test
proves the customized contract.

AI tools and developers must not "fix" a failing default generated test by
editing generated files or deleting framework assertions. First identify which
contract is under test:

- If a platform invariant fails, investigate shared Nodics runtime behavior.
- If a default module contract fails while default modules are active,
  investigate framework module behavior.
- If a customized project contract differs intentionally, regenerate or extend
  project-owned effective-contract tests from the active definitions.
- If compatibility with the default framework contract is required, run that as
  an explicit compatibility suite and report intentional project deviations as
  not applicable or overridden, not as silent failures.

For active development:

- Run focused tests for the module or behavior changed.
- Run syntax or contract checks when touching shared runtime paths.
- Regenerate and validate LLM context when changing module structure,
  documentation, or AI guidance.

Before commit or release:

- Run the relevant module test suite.
- Run `npm run ai:validate`.
- Run `npm run llm:validate`.
- Run `npm run quality:docs`.
- Run `npm run release:check` to print the clean-checkout release gate and use
  `npm run release:check -- --execute` or
  `npm run release:check -- --execute --full` for release-candidate evidence.
- Run broader/full checks when shared runtime behavior, security, persistence,
  cache, auth, schema, router, or generated artifacts are affected.

## Production Operating Evidence

Release evidence must include the production operating model when a change
affects startup, topology, health, readiness, shutdown, observability, secrets,
audit retention, backup/restore, rollback, diagnostics, or support surfaces.

Health endpoints follow this split:

- liveness is low-disclosure and may be unauthenticated for orchestrators;
- readiness has a low-disclosure public probe for orchestration; detailed
  readiness is secured, topology-gated, sanitized, and project-extensible.

Distributed validation must describe results in terms of active modules and
runtime instances. Server configurations are test compositions and coordinate
sources, not the capability unit. Registration tests must cover API and non-API
modules, multiple instances of one module, identity mismatch, lease expiry,
restart reconciliation, and authorized client filtering.

For module registration changes, the modular topology gate must inspect
observed registry state through a test-only mechanism, wait for asynchronous
reconciliation, and restart at least one runtime process. It must prove the old
runtime identity is removed or expires and the replacement identity registers;
it must not expose a production test or bypass route.

Catalogue and bootstrap changes must test source-schema reuse in OpenAPI,
unknown-field rejection, secret-field rejection, module-owned metadata,
permission filtering, compatible/degraded/incompatible negotiation, sanitized
auditing, and the absence of named-environment coupling.

BackOffice capability discovery changes must additionally test source-owner
filtering, safe URL construction, timeout and response bounds, deterministic
hashing, all change classifications, preservation of the last safe snapshot,
authorized provider selection, fallback behavior, and asynchronous registration.

Durable BackOffice contract-history changes must additionally test generated
persistence integration, immutable/idempotent observations, automatic safe
activation, pending breaking candidates, action-specific route authorization,
invalid coordinates and bounds, stale and concurrent pointer revisions,
interrupted state-write reconciliation, rejection, rollback restrictions,
retention protection, sanitized diagnostics, repository restart recovery, and
modular runtime discovery. The modular gate must restart BackOffice and preserve
the active contract hash and activation revision across process-cache recovery.

When adding a provider or server/node responsibility, add or update readiness
checks through the owning module or a later project module. Do not expose
credentials, provider URLs, private file paths, tenant data, or raw diagnostics
from health responses.

Full validation should happen at commit/release gates or periodic checkpoints,
not after every tiny edit, so Nodics remains practical for AI-assisted
development without sacrificing quality.
