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
