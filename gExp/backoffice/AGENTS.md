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
- Persist normalized observations through BackOffice-owned Nodics schemas and
  generated services. The durable activation pointer is current-selection and
  replica-concurrency authority; breaking candidates require explicit,
  permissioned, reasoned, revision-protected decisions.
- Retention must protect active and pending observations. Rollback selects a
  retained safe observation; it never edits or deploys a target-module contract.
- Repair partial decision failures from the durable activation pointer using
  snapshot revisions. Diagnostics may expose bounded counts and stable failure
  codes, never persisted documents, provider details, or database messages.
- UI-composition providers declare non-executable defaults. Provider selection
  may be layered, but BackOffice must not proxy CMS data-plane traffic or return
  executable code.
- Availability is a freshness-bounded observation of the target's existing
  public readiness contract. Deduplicate by runtime instance, retain no raw
  response, and never turn BackOffice into target health or readiness authority.
- Availability transition events must use the existing Nodics event capability,
  publish only sanitized changed state, suppress unchanged-state storms, and
  remain fail-open and asynchronous to registration and application traffic.
- Environment-specific provider, namespace, lease, audit, readiness, and
  workload-identity settings belong in the established group modules below
  `envs`. Never hardcode a named environment in reusable BackOffice behavior.
- Every sensitive route requires an action-specific permission or governed
  `permissionConfig`; topology-sensitive routes also require `apiExposure`.
- Registry administration must query the owning lease store, use bounded
  filters and client-safe projection, and reuse existing discovery and
  availability observers for refresh rather than adding a parallel scheduler.
- Distributed expiry must use provider-atomic compare-and-delete semantics;
  stale scans must never delete renewed leases. Ephemeral caches reconcile from
  active leases without deleting durable active or pending contract history.
- Use existing Nodics lifecycle, module registry, service communication,
  schema/router governance, audit, and generated-artifact paths. Do not add a
  parallel loader, runtime activation mechanism, or authorization path.
- Every new extension point requires positive, negative, boundary, security,
  consolidated/modular topology, and later-loaded override tests as applicable.
