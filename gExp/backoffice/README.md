# backoffice

`backoffice` is the backend registry, discovery, catalogue, compatibility, and
bootstrap capability for the separate Nodics Axis administration application.

## Responsibilities

- Receive authenticated module self-registration and refresh requests.
- Maintain environment-bound observed deployment registrations.
- Discover and validate module identity, versions, capabilities, contracts, and
  sanitized health information.
- Expose a permission-filtered, client-safe registry to Nodics Axis.
- Select an optional CMS UI-composition provider without depending on CMS at
  package or startup level.
- Track BackOffice presentation enablement, compatibility, availability, and
  registry/discovery audit history.

## Explicit Exclusions

- No frontend source or executable UI delivery.
- No proxying of normal CRUD, job, workflow, CMS, or business operations.
- No replacement of target-module permissions, validation, tenant isolation,
  runtime activation, or business audit.
- No credentials, internal tokens, private keys, or unapproved internal
  endpoints in frontend registry responses.
- No parallel schema, router, topology, runtime-governance, or health authority.

## Runtime Interaction

The frontend authenticates with Profile, retrieves its authorized registry from
BackOffice, and then calls registered modules directly. Each target module
independently validates the Profile-issued human token and authorizes the
requested operation.

Module registration uses the separate Nodics service-to-service identity path.
Registration must be idempotent, environment-bound, auditable, retryable with
bounded backoff, and safe when BackOffice is unavailable.

The store defaults to process memory for local and single-instance operation.
Production replicas configure `backofficeRegistry.store.mode` as `distributed`;
the same store service then uses the configured nCache-owned distributed engine
with provider TTL leases and incremental key scanning. BackOffice never creates
or owns a second Redis connection. Modules reconcile automatically after
BackOffice or module restart through bounded retry and periodic renewal.

See [the registry contract](docs/module-registry-contract.md) and
[the operations runbook](docs/registry-operations-runbook.md). API, catalogue,
compatibility, and audit behavior is defined by
[the API catalogue contract](docs/api-catalogue-contract.md); deployment
configuration follows [the environment deployment contract](docs/environment-deployment-contract.md).
Module capability discovery, safe snapshot behavior, and CMS provider selection
follow [the capability discovery contract](docs/capability-discovery-contract.md).
Durable observation history, breaking-change approval, rejection, rollback,
retention, and replica concurrency follow
[the contract history lifecycle](docs/contract-history-lifecycle.md).
Runtime readiness observation and multi-instance availability aggregation follow
[the availability observation contract](docs/availability-observation-contract.md).
The same contract governs deduplicated state-transition events and sanitized
probe/publication metrics through Nodics' existing event capability.
Bounded administrative inventory, detail, and governed refresh behavior follow
[the registry administration contract](docs/registry-administration-contract.md).
Human/service separation and the administrative permission matrix follow
[the administrative security contract](docs/administrative-security-contract.md).
Structural scale budgets and benchmark evidence follow
[the performance and scale contract](docs/performance-and-scale-contract.md).
Backend go-live, monitoring, rollback, and residual-risk gates follow
[the backend release-readiness checklist](docs/backend-release-readiness.md).
The current evidence, acceptance decision, and remaining production gates are
recorded in [the backend acceptance report](docs/backend-acceptance-report.md).

## Customization

Projects may override BackOffice configuration and contribute same-named
services, facades, controllers, routers, schemas, pipelines, interceptors, and
tests from later active modules. Override the smallest method or definition
required; do not copy the whole capability.

Control-plane registration routes require the governed internal-token
permission. Human discovery and diagnostics routes require distinct BackOffice
permissions and return only configured client-safe metadata.
