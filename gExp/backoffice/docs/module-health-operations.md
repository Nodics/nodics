# Module Health Operations

## What this capability answers

Module Health helps an authorized business operator answer two questions:

1. Is a Nodics module available through at least one registered runtime?
2. Which registered environment, server, and node produced a healthy,
   unavailable, stale, or missing readiness observation?

A **module** is a capability such as Profile, CMS, Workflow, or BackOffice. A
**runtime instance** is one running Nodics process selected by environment,
server, and optional node coordinates. One process may host many modules in
`monoServer`; distributed topologies may have several processes for a module.

Nodics System owns liveness and readiness. Nodics configuration owns selected
topology and active modules. BackOffice owns freshness-bounded observations and
registered-instance presentation only. Module Health is not a second health or
deployment-topology authority.

The detail and refresh routes resolve path parameters through the standard
Nodics HTTP request wrapper as well as direct service-test requests. On-demand
refresh is limited to registered client-callable instances. Modules without a
callable endpoint retain heartbeat visibility but cannot be actively probed
through Axis.

## Business-user workflow

1. Sign in to Axis with an employee account that has
   `backoffice.registry.admin.view`.
2. Open **Operations and Integration > Module Health**.
3. Interpret the summary:
   - **Healthy**: every registered instance is freshly ready.
   - **Degraded**: at least one instance is ready and another is unavailable or
     unknown.
   - **Unavailable**: every fresh registered instance is unavailable.
   - **Unknown**: no fresh reliable conclusion exists.
4. Search by module, environment, server, or state.
5. Select a module to inspect registered nodes, last heartbeat, last readiness
   observation, freshness, and bounded reason code.
6. With `backoffice.registry.refresh`, choose **Check now**. This reuses the
   existing observer and does not create a browser poller.

Do not interpret a missing instance as proof that an expected node failed. An
expired or intentionally deregistered instance is no longer active registry
data. Expected cluster membership remains deployment/topology policy.

## State and freshness

Instance state is `UP`, `UNAVAILABLE`, or `UNKNOWN`. Freshness is:

- `FRESH`: observation is within
  `backofficeRegistry.availability.staleAfterMs`;
- `STALE`: prior evidence is too old to support a conclusion;
- `MISSING`: the active lease has not produced an observation.

Only stable reasons are returned: `READINESS_NOT_UP`,
`OBSERVATION_TIMEOUT`, `HEALTH_OBSERVATION_FAILED`, `OBSERVATION_STALE`, and
`OBSERVATION_MISSING`. Raw readiness payloads, provider errors, stacks,
credentials, private configuration, and secrets are never returned.

## API and security

Axis reuses:

- `GET /nodics/backoffice/v0/registry/admin/modules`
- `GET /nodics/backoffice/v0/registry/admin/modules/:moduleName`
- `POST /nodics/backoffice/v0/registry/admin/modules/:moduleName/refresh`

List/detail require `backoffice.registry.admin.view`; refresh requires
`backoffice.registry.refresh`. Human administration rejects service tokens and
preserves tenant consistency. Backend authorization remains authoritative even
when Axis hides a control.

The detail response combines the client-safe lease with the sanitized
projection owned by `DefaultBackofficeAvailabilityService`. It adds no health
route, schema loader, registry, scheduler, or topology authority.

Every runtime package owns its default business-facing label through
`package.json.nodics.displayName`. The module loader remains authoritative for
physical parent/child relationships and canonical identity. Registration
observes that metadata; BackOffice does not maintain a duplicate label or
hierarchy configuration.

The underlying `moduleName` remains the immutable identifier used for API
paths, filtering, authorization, audit, and refresh. Administrative list
responses include `displayName`, `parentModule`, and `canonicalIdentity`.
Group availability is derived from observed non-group descendants: all ready
is `UP`, all unavailable is `UNAVAILABLE`, all unknown is `UNKNOWN`, and a
mixed result is `DEGRADED`. This summary does not replace System readiness or
infer missing cluster members.

## Failure and recovery examples

- If two Profile nodes are ready and one returns `DOWN`, Profile is
  `DEGRADED`. Axis identifies the registered unavailable node. Normal renewal
  or an authorized refresh records recovery.
- A timeout appears as `UNAVAILABLE`, `FRESH`, and
  `OBSERVATION_TIMEOUT`. Operators inspect the process, network, TLS,
  allowlist, and timeout; they never manually mark it healthy.
- Stale evidence appears as `UNKNOWN`, `STALE`, and `OBSERVATION_STALE`; it
  never remains falsely healthy.
- A `monoServer` process failure affects every hosted module. Use distributed
  local topology to prove that one failed replicated node degrades only its
  module.

## Customization and verification

Projects may override timing and host policy through layered `properties.js`
or replace the observer through a later module while preserving semantics,
bounded disclosure, authorization, and lifecycle. Do not add an Axis health
database, a second polling service, or direct provider checks.

Evidence covers healthy, negative readiness, transport failure, timeout,
stale/missing evidence, multi-instance aggregation, permission rejection,
refresh throttling, consolidated and distributed topology, recovery,
responsive rendering, keyboard access, and registration regression.
