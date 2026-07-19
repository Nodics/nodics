# BackOffice Documentation

This folder owns permanent human-readable documentation for the BackOffice
backend capability. Document registry, discovery, self-registration,
compatibility, security, operational, and customization contracts here as they
are implemented.

The separate Nodics Axis frontend is a consumer of these APIs and is not part of
this runtime module.

- `module-registry-contract.md` defines ownership, identity, leases, discovery,
  storage, and reconciliation behavior.
- `registry-operations-runbook.md` defines production configuration,
  diagnostics, failure behavior, rollout, and recovery checks.
- `api-catalogue-contract.md` defines API schemas, module-owned metadata,
  compatibility negotiation, and audit events.
- `environment-deployment-contract.md` defines deployment configuration through
  the existing `envs` module-group layering without named-environment coupling.
- `capability-discovery-contract.md` defines module-owned provider roles,
  bounded OpenAPI discovery, normalized snapshots, change classification, and
  CMS UI-composition provider selection.
- `contract-history-lifecycle.md` defines durable immutable observations,
  activation-pointer concurrency, approval, rejection, rollback, retention,
  authorization, recovery, and validation behavior.
- `availability-observation-contract.md` defines bounded public readiness
  observation, freshness, multi-instance aggregation, security, recovery, and
  diagnostics behavior.
- `registry-administration-contract.md` defines bounded administrative search,
  sanitized detail, action-specific permissions, and observer-reuse refresh.
- `administrative-security-contract.md` defines human/service separation,
  permission ownership, tenant isolation, refresh abuse controls, and auditing.
- `performance-and-scale-contract.md` defines structural performance budgets,
  bounded probe pressure, deterministic benchmark evidence, and load-test scope.
