# backoffice Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../AGENTS.md`.
- Follow the `gExp` group contract: `../AGENTS.md`.
- Follow global guidance: `../../gSetup/llm/README.md`.

## Capability Boundary

- `backoffice` is the backend registry, discovery, catalogue, compatibility,
  availability-summary, and bootstrap capability for Nodics Axis.
- Nodics Axis is a separate frontend application. Never add frontend source,
  executable UI code, browser bundles, or static rendering behavior here.
- The frontend retrieves its authorized registry from this module and then
  calls Profile, CMS, CronJob, Workflow, and other registered modules directly.
  Do not proxy normal business CRUD or operational traffic through BackOffice.
- BackOffice owns observed registration/discovery state and BackOffice
  presentation enablement. `nConfig`, `nService`, `nSystem`, `nDynamo`, Profile,
  and target modules remain authoritative for topology, activation, health,
  runtime governance, identity, permissions, contracts, and business behavior.
- Module self-registration is service-to-service traffic. Keep it separate
  from employee/customer username-password authentication and preserve tenant,
  environment, module-identity, replay, idempotency, audit, and secret-redaction
  boundaries.
- Return only client-safe public connection metadata. Never return internal
  tokens, credentials, private keys, secret references, or unapproved internal
  endpoints to the frontend.
- Optional catalogue and navigation metadata must be declared by the owning
  module in `package.json#nodics.backoffice`. BackOffice validates and
  permission-filters that metadata; it must not maintain a duplicated manual
  module catalogue.
- Discover effective contracts through existing System/OpenAPI authorities.
  Normalize and hash client-safe observations; never add a parallel schema or
  router loader, retain arbitrary source documents, or let BackOffice edit a
  target module's contract.
- UI-composition providers declare non-executable defaults. Provider selection
  may be layered, but BackOffice must not proxy CMS data-plane traffic or return
  executable code.
- Environment-specific provider, namespace, lease, audit, readiness, and
  workload-identity settings belong in the established group modules below
  `envs`. Never hardcode a named environment in reusable BackOffice behavior.
- Every sensitive route requires an action-specific permission or governed
  `permissionConfig`; topology-sensitive routes also require `apiExposure`.
- Use existing Nodics lifecycle, module registry, service communication,
  schema/router governance, audit, and generated-artifact paths. Do not add a
  parallel loader, runtime activation mechanism, or authorization path.
- Every new extension point requires positive, negative, boundary, security,
  consolidated/modular topology, and later-loaded override tests as applicable.
