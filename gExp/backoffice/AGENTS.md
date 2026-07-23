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
  module in `config/properties.js#backofficeCapabilities.<moduleName>`. BackOffice validates and
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
- BackOffice may package Nodics Axis reference composition as module-owned core
  data, but nCatalog and CMS remain schema, persistence, delivery, and runtime
  authorities. Use the existing nData import lifecycle; never import content as
  a BackOffice startup side effect or add an Axis-specific loader.
- Axis content is employee-only and fail-closed. Only explicitly classified
  employee login and recovery routes/components may be public; all post-login
  page composition is authenticated. A public page may never reference an
  authenticated component.
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
- Human administrative routes must reject service tokens, require a stable
  principal, preserve tenant consistency, use action-specific route permissions,
  and apply bounded per-principal/module refresh idempotency and throttling.
- Core performance gates must prefer deterministic path/operation budgets and
  sanitized timing evidence. Availability work requires layered active/queue
  ceilings and must never block registration or application traffic.
- Operational readiness may aggregate only stable low-disclosure diagnostics
  from owning services. Environment layers decide whether distributed storage
  is mandatory and own real alert thresholds, provider secrets, and load gates.
- Production mode must fail closed on weak storage, endpoint, host-allowlist,
  human-administration, audit-delivery, or alert-delivery policy. Publisher
  adapters remain environment-owned and must acknowledge sanitized delivery.
- Use existing Nodics lifecycle, module registry, service communication,
  schema/router governance, audit, and generated-artifact paths. Do not add a
  parallel loader, runtime activation mechanism, or authorization path.
- Live provider tests must consume provider clients through the owning nCache
  test bridge. BackOffice tests must not import a restricted provider SDK or
  create a production connection authority.
- Every new extension point requires positive, negative, boundary, security,
  consolidated/modular topology, and later-loaded override tests as applicable.
