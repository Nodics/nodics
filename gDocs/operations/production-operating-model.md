# Production Operating Model

Production operation is the contract for running Nodics safely after the
application has been built, configured, deployed, and opened for traffic.

It answers five questions:

- What is running?
- Is it alive?
- Is it ready to serve traffic?
- Can operators diagnose and recover problems without exposing sensitive data?
- Can a release be rolled forward, rolled back, or isolated by topology?

## Beginner Summary

Production operation is about trust. A production Nodics runtime must tell
operators what is running, whether it can accept traffic, how to diagnose
failures, and how to recover safely.

For beginners, separate these concepts:

| Concept | Meaning |
| --- | --- |
| Liveness | The process can answer a very small HTTP probe. |
| Readiness | The process has completed required startup checks and can receive traffic. |
| Observability | Logs, diagnostics, metrics, and audit explain what happened. |
| Rollback | The system can return to a known safe state. |
| Topology | The project/environment/server/node shape explains what runs where. |

Nodics can run as a consolidated server during local development or as multiple
server/node processes in an enterprise topology. The operating model must work
for both. A production-ready project should not depend on a single all-in-one
process unless that topology is an intentional deployment decision.

## Runtime Topology

A Nodics deployment is described through project, environment, server, and node
modules.

| Runtime Layer | Production Responsibility |
| --- | --- |
| Project | Owns the application composition, project modules, documentation, and default project policy. |
| Environment | Owns deployment class such as local, QA, UAT, pre-production, or production. |
| Server | Owns a runnable process, active module selection, ports, provider endpoints, and process-level responsibility. |
| Node | Owns instance-specific behavior below a server, such as scheduled-job ownership or capacity separation. |
| Tenant | Owns data placement, isolation, runtime governance, and tenant-specific data behavior. |

Keep local activation and remote communication separate. `activeModules`
decides what runs inside the current process. `server.*` endpoint coordinates
describe where other capabilities can be reached. Do not activate modules
implicitly through tenant, server URL, or request data.

## Health Endpoints

Nodics exposes health probes through `nSystem`.

| Endpoint | Purpose | Security Contract |
| --- | --- | --- |
| `GET /nodics/system/v0/health/live` | Confirms that the process can answer HTTP. | Unsecured and intentionally low-disclosure. |
| `GET /nodics/system/v0/health/ready` | Confirms that the runtime has completed required startup invariants. | Secured with `system.health.readiness.view` and gated by `apiExposure.categories.operationalHealth`. |

Liveness must be safe for load balancers and orchestrators. It returns only a
minimal `UP` status and must not expose paths, provider URLs, credentials,
tenant details, module lists, cache keys, or diagnostics.

In Nodics route metadata, liveness uses `publicProbe: true`. This is different
from a normal `secured: false` business route. A normal non-secured route still
resolves enterprise and tenant context for pre-authentication or public business
flows. A public probe is infrastructure-only and intentionally bypasses
enterprise/tenant request resolution.

Readiness is operational information. It may report sanitized runtime state
such as server state, selected environment/server/node names, active module
count, active tenant count, and readiness checks. It must stay secured because
it helps operators understand the running topology.

## Readiness Baseline

The framework readiness baseline checks:

- runtime state is `started`;
- a server has been selected;
- active modules have been loaded;
- at least one tenant is active.

Projects may extend readiness in later modules. Common project checks include:

- database connection is reachable;
- cache engine is reachable;
- search provider is reachable;
- EMS or message broker is reachable;
- required runtime configuration is active;
- required secrets are present through governed secret sources;
- import/export locations or provider aliases are configured;
- node-owned scheduled jobs are not running on unauthorized nodes.

Provider checks must be sanitized. Do not return credentials, full URLs,
private paths, tokens, raw connection strings, or customer data from readiness.

## Startup And Traffic Admission

Startup must complete before traffic is admitted.

The runtime state moves to `started` only after normal startup has completed.
Readiness should be the gate used by load balancers, API gateways, container
orchestrators, and deployment automation before sending business traffic to the
process.

In a modular deployment, each server has its own readiness responsibility. A
profile server, import server, event server, scheduled-job server, and content
server may all be healthy independently. Do not treat one process as proof that
the whole environment is ready.

## Secrets

Production secrets must come from governed sources, not source-controlled files.

Examples include:

- environment variables managed by deployment automation;
- external property files outside source control;
- secret-manager integrations;
- runtime secret providers.

The production operating model must identify required secrets for each server
and node, including authentication, API keys, database, cache, search,
messaging, storage, import/export, and provider credentials.

## Observability

Production observability should answer:

- Which server/node handled the request?
- Which tenant and enterprise context was used?
- Which route, pipeline, service, schema, job, event, import, export, cache, or
  provider was involved?
- What correlation id links logs, audit, diagnostics, and errors?
- Was the failure caused by validation, permission, dependency, timeout,
  configuration, provider, or data quality?

Logs and diagnostics must be sanitized. Passwords, bearer tokens, API keys,
refresh tokens, cookies, authorization headers, credentials, private keys, and
secret values must never be emitted.

## Audit And Retention

Runtime mutation paths must preserve audit evidence:

- runtime configuration preview/request/approval/activation/rollback;
- schema and router governance changes;
- identity and permission governance;
- import/export runs;
- credential rotation;
- operational route usage where policy requires it.

Retention must be defined by project and environment. Local development may
keep short retention. Production may require longer retention for audit,
compliance, support, and incident investigation.

## Backup, Restore, And Rollback

Production readiness is not complete until restore and rollback are proven.

At minimum, define:

- database backup and restore;
- search index rebuild or restore;
- cache warm-up or safe flush strategy;
- import run retry and failed-record handling;
- runtime configuration rollback;
- versioned or publishable data rollback;
- deployment rollback;
- tenant-specific recovery when one tenant is affected.

Manual database repair should not be the normal recovery strategy.

## Release Gates

Before release, run:

```bash
npm run release:check -- --execute
```

For release-candidate evidence, run:

```bash
npm run release:check -- --execute --full
```

Projects with live providers must also run the guarded live-provider gates for
their chosen providers, such as Redis, Elasticsearch, Kafka, SFTP, object
storage, or other production dependencies.

## Support Diagnostics

Support diagnostics should be available through governed APIs, reports, or
deployment tooling. They should help operators inspect runtime state without
exposing sensitive information.

Useful diagnostic evidence includes:

- runtime topology summary;
- active module list;
- active tenant count;
- generated OpenAPI artifact status;
- provider maturity status;
- route exposure categories;
- runtime configuration governance summary;
- import/export run summaries;
- cache and search diagnostics;
- recent sanitized error summaries.

Every diagnostic surface must have an owner, permission, exposure category,
redaction policy, and test coverage.

## Beginner Production Checklist

Before calling a Nodics deployment production-ready, confirm:

- every server/node has a clear owner and active-module list;
- liveness and readiness probes are configured with the correct versioned URLs;
- readiness checks are secured and sanitized;
- production secrets do not live in source-controlled files;
- data backup and restore have been tested;
- runtime configuration rollback works;
- import/export failures can be diagnosed and retried;
- scheduled jobs run only on responsible nodes;
- cache can be safely flushed or rebuilt;
- generated OpenAPI reflects deployed routes;
- local-only API exposure categories are disabled;
- release gates pass from a clean checkout.

## What To Avoid

Avoid:

- exposing readiness publicly with detailed topology or provider data;
- treating every `secured: false` route as public infrastructure; use
  `publicProbe: true` only for low-disclosure probes;
- returning secrets, URLs with credentials, private file paths, or tenant data
  from health endpoints;
- treating a consolidated local server as proof of modular production readiness;
- enabling local-only control-plane APIs in production;
- deploying without a clean-checkout release gate;
- using sample bootstrap credentials in production;
- relying on manual database changes for rollback;
- allowing scheduled jobs to run on every node without ownership rules.
