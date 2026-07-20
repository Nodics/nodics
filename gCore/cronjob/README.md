# cronjob

`cronjob` runs business work at a planned time or on an approved manual
request. A persisted job definition describes the schedule and execution
handler; a process-local scheduler executes only jobs assigned to its node for
the active tenant.

## Who Uses CronJob

| Persona or caller | Typical workflow | Boundary |
| --- | --- | --- |
| Business operator | Inspect, run, pause, resume, or stop an allowed job | Secured command routes and tenant-scoped permissions |
| Module or scheduled process | Execute work against another module | Tenant-bound internal token and target-module authorization |
| Project developer | Add a project-specific schedule and handler | Later module definitions, services, pipelines, events, and tests |
| Platform operator | Assign nodes, monitor runs, drain/restart processes, and recover failures | Environment/server/node configuration plus persisted CronJob state |
| BackOffice client | Discover and invoke allowed CronJob operations | CronJob remains scheduler and route authority |

**Maturity: Production-ready capability.** Multi-node production scheduling
still requires project-owned topology, node monitoring, job idempotency,
operational alerting, and release validation. Node failover handlers exist, but
`nodePingableModules.cronjob.enabled` is disabled by default.

## Ownership And Boundaries

The module owns scheduled execution, lifecycle services, secured routes,
persistence schemas, pipelines, interceptors, events, initializer data, and
tests. It participates in the shared runtime lifecycle: drain stops new job
acquisition and process-owned schedules before connection shutdown, while
persisted definitions survive hard termination.

CronJob is owned and activated as a **module**, not as a server capability. A
server only hosts one or more active modules. `runOnNode` selects the normal
execution node and `tempNode` can represent temporary failover ownership; these
placement fields do not transfer module authority or create another registry.

CronJob owns its optional BackOffice catalogue declaration in `package.json`.
That declaration advertises discovery and navigation metadata only. CronJob
continues to protect and execute every operation, and its effective System
OpenAPI contract remains the route authority.

## Job Definition

A persisted definition describes:

- code, active state, tenant, schedule/trigger, start, and optional end;
- handler/service and job-detail behavior;
- normal node placement and temporary ownership where enabled;
- run-on-initialization behavior and priority;
- lifecycle state, last execution status, logs, and events;
- access, timeout, retry, failure, retention, and operational expectations.

Definitions and defaults come from active modules and layered configuration.
Project, environment, server, node, tenant, and runtime layers may override
allowed behavior. Customer-specific jobs belong in project modules; reusable
scheduler mechanics belong here. Do not edit generated files or rely on
startup side effects that create duplicate definitions.

## Execution And Ownership Model

```text
persisted tenant job -> eligible CronJob module instance -> assigned node pool
                    -> scheduled/manual trigger -> handler or target module
                    -> state, log, event, and operational evidence
```

The persisted definition is authoritative; the in-memory pool is disposable.
A node creates a scheduler only when its identifier matches `runOnNode` or an
approved temporary `tempNode`. Node-down handling may create temporary local
ownership, and node-up handling removes that temporary copy. Projects must
enable and qualify node monitoring before depending on failover in production.

This model prevents intentional duplicate placement, but it is not a
distributed transaction or universal exactly-once guarantee. Network
partitions, delayed failure detection, process termination, and downstream
timeouts can create uncertain outcomes. Jobs that change external state must
define an idempotency key, duplicate/overlap policy, timeout, retry safety, and
reconciliation or compensation behavior.

## Lifecycle Commands

CronJob supports create/register, update, run, start, stop, remove, pause, and
resume through its owning controller, service, and process-local container.
State-changing routes are secured command APIs: `POST` for create, run, start,
stop, pause, and resume; `PATCH` for update; and `DELETE` for removal. Do not
expose these operations through `GET` or place business logic in route handlers.

Scheduled triggers and manual `run` commands share the job definition and
handler contract. Manual execution must not bypass tenant context, node
eligibility, running-job protection, target permissions, logging, or failure
handling. A human bearer token can authorize a CronJob command; module calls
performed by the job use the separate tenant-scoped internal service-token flow.

## Resilience And Recovery

- Graceful drain rejects new scheduler acquisition and stops process-owned
  schedules before connection shutdown.
- Startup rebuilds eligible local schedules from active tenant definitions.
  Creation and start behavior must remain idempotent and report partial failure.
- Distinguish handler failure, target timeout, node loss, invalid definition,
  and unknown completion. Retry only when the handler contract is safe.
- Prevent or explicitly govern overlapping execution. A process-local running
  flag cannot protect across nodes or after a crash.
- Persist safe execution evidence and provide quarantine, reconciliation,
  replay, or compensation for business-critical jobs.
- CronJob startup must not block unrelated module readiness indefinitely while
  waiting for Profile, BackOffice, NEMS, or a target module. Follow the shared
  bounded dependency and runtime lifecycle contracts.

## Security

Every lifecycle route requires authentication and the effective route/schema
authorization policy. Tenant context must constrain definition lookup and
execution. Jobs calling another module use governed internal credentials and
must satisfy that target module's permissions; human username/password login is
never a module-to-module credential flow.

Do not accept arbitrary service names, URLs, node identifiers, credentials, or
executable handlers from untrusted request data. Resolve approved definitions
from active-module source/configuration and preserve audit, redaction, and
secret-management boundaries.

## Performance And Observability

Set project limits for active jobs per tenant/node, trigger frequency,
concurrency, execution duration, payload size, log retention, and downstream
rate. Avoid unbounded tenant scans or large payloads retained in scheduler
memory.

Monitor scheduler readiness, pool size, due/started/completed/failed/skipped
runs, schedule delay, duration, retry, overlap denial, temporary ownership, node
handoff, downstream latency, and stale running state. Carry tenant, job code,
execution/correlation identity, trigger type, assigned node, attempt, and safe
outcome through logs and traces. Never record service tokens, credentials, or
sensitive business payloads.

## Verification And Release Evidence

Run `npm run test:suite -- --suite=cronjob`. Every real job also needs positive, invalid
definition, unauthorized, cross-tenant, schedule-boundary, manual-run,
duplicate/overlap, timeout, retry, partial-failure, restart, drain, node-loss,
node-return, downstream-recovery, idempotency, reconciliation, integration, and
regression tests. Multi-node and external-provider claims require guarded live
topology tests in the deployment environment.

## Continue

- Core capability family: [gCore](../README.md)
- Profile and service identity: [profile](../profile/README.md)
- Messaging and events: [nEms](../../gFramework/nEms/README.md)
- Runtime module lifecycle: [nService](../../gFramework/nService/README.md)
- Capability maturity: [Provider And Capability Maturity Matrix](../../gDocs/reference/provider-capability-maturity-matrix.md)
