# BackOffice Backend Acceptance Report

## Decision

The BackOffice backend capability is accepted for continued integration and
environment validation. It is not yet approved for production deployment.
Nodics Axis remains outside this acceptance boundary.

This decision is based on the repository state validated on 2026-07-19. The
formal clean-checkout gate passed after correcting local build composition so
the authoritative consolidated environment includes `gExp` and therefore
regenerates BackOffice schema services used by modular runtimes.

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

1. Rerun the full release gate on a governed supported Node major. This run used
   Node 25.2.1; repository dependency governance supports Node 22 and 24 and
   marks Node 25 unsupported.
2. Exercise the selected real distributed cache provider, including atomic
   compare/delete, TTL renewal, incremental scan, provider interruption, and
   recovery. A configured live Redis contract was not executed here.
3. Run true multi-process and multi-replica BackOffice reconciliation against
   that provider and the production database topology.
4. Execute deployment-sized registration, renewal, discovery, availability,
   administrative scan, and refresh load with accepted latency and saturation
   budgets.
5. Prove external sanitized audit delivery, alert routing, dashboards, and
   operator acknowledgement using the environment integrations.
6. Complete security review of environment secrets, TLS, network policy,
   origin exposure, database access, retention, and operational permissions.

## Release posture

Until every required production item has an owner and evidence, deploy only to
development or controlled integration environments. Preserve the distributed
lease namespace and durable contract database during rollback, and use the
existing environment layering for all provider and deployment configuration.
