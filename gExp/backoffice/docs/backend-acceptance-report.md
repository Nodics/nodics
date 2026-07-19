# BackOffice Backend Acceptance Report

## Decision

The BackOffice backend capability is accepted for continued integration and
environment validation. It is not yet approved for production deployment.
Nodics Axis remains outside this acceptance boundary.

This decision is based on the repository state validated through 2026-07-20.
The formal clean-checkout gate passed under supported Node 24.18.0 after
correcting local build composition so the authoritative consolidated environment
includes `gExp` and therefore regenerates BackOffice schema services used by
modular runtimes.

## Evidence collected

| Area | Evidence | Result |
| --- | --- | --- |
| Clean dependency and generation flow | `npm run release:check -- --execute --full` ran `npm ci`, clean, build, LLM validation, documentation quality, basic tests, and the full suite | Passed |
| Dependency audit | `npm ci` audited 521 packages | Passed with zero reported vulnerabilities |
| BackOffice contracts | Focused module, route, API, registry, discovery, history, availability, security, performance, audit, and operational-readiness tests | Passed |
| Consolidated runtime | Module communication, public readiness, and protected readiness detail | Passed |
| Modular runtime | Seven configured module runtimes, direct module communication, public readiness, and protected readiness detail | Passed |
| Registration and recovery | 419 active leases, 80 registered modules, contract discovery, CMS restart reconciliation, BackOffice restart recovery, and availability recovery | Passed |
| Clean-build regression | BackOffice boundary test requires `gExp` in the consolidated build authority; modular topology proves generated persistence services are usable after clean/build | Passed |
| Generated contracts | Schema/API generated tests, OpenAPI generation, documentation governance, and module LLM validation included in the release gate | Passed |
| Live Redis adapter | Existing guarded nCache Redis contract executed against the local provider | Passed on 2026-07-20 |
| Live distributed lease store | Two independent Redis clients proved shared visibility, TTL expiry, atomic stale-delete rejection, interruption failure, restored-client recovery, isolated scanning, and scoped cleanup | Passed on 2026-07-20 |
| Multi-process lease coordination | Separate Node.js processes proved shared visibility and stale-process protection through the nCache-owned Redis bridge | Passed on 2026-07-20 |
| Live provider load | 5,000 leases at concurrency 64, complete cross-client scan, and environment-owned latency enforcement | Passed locally in 30.541 ms on 2026-07-20 |
| Audit and alert delivery contract | Strict acknowledgement, unavailable/unacknowledged failure, sanitized payload, and unchanged-state deduplication | Passed with test publishers |
| Production security posture | Fail-closed validation for distributed storage, HTTPS, host allowlists, human administration, and strict audit/alert publishers | Passed with layered contract fixtures |

Counts are observations from this validation run, not production sizing
guarantees. They may change as the active module composition evolves.

## Behavior covered

The automated evidence covers positive, negative, boundary, contract,
integration, and regression behavior for the implemented backend scope:

- asynchronous authenticated module registration, renewal, expiry, and restart
  reconciliation;
- client-safe inventory and direct-module connection metadata without a
  BackOffice business-operation proxy;
- human administrative identity separation from module/service identity;
- tenant and permission enforcement, refresh throttling, and idempotency;
- bounded discovery, immutable contract history, approval, rejection,
  activation, and rollback behavior;
- availability aggregation, readiness policy, metrics, sanitized audit events,
  and alert-state calculation;
- concurrency, queue, backoff, pagination, scan, lease, and refresh structural
  performance limits.

## Required production evidence

The following gates were not proven by this local acceptance run and remain
mandatory before production approval:

1. Repeat the live Redis contracts against the selected deployment provider
   using governed TLS, credentials, network policy, and the final nCache
   configuration. Local Redis evidence does not qualify that infrastructure.
2. Run complete multi-replica BackOffice application runtimes against that
   provider and the production database topology. Local evidence covers
   independent clients, separate lease-store processes, and application restart
   recovery, but not the final orchestrated deployment.
3. Execute deployment-sized registration, renewal, discovery, availability,
   administrative scan, and refresh load with accepted latency and saturation
   budgets.
4. Execute the acknowledged audit and alert contracts using the selected
   external adapters, then prove routing, dashboards, and operator
   acknowledgement. Local evidence uses contract test publishers.
5. Complete security review of environment secrets, TLS, network policy,
   origin exposure, database access, retention, and operational permissions.

## Release posture

Until every required production item has an owner and evidence, deploy only to
development or controlled integration environments. Preserve the distributed
lease namespace and durable contract database during rollback, and use the
existing environment layering for all provider and deployment configuration.
