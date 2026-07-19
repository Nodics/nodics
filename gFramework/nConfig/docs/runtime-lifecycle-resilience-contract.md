# Nodics Runtime Lifecycle and Resilience Contract

## Ownership

`nConfig` owns the single process lifecycle coordinator and process signal
handlers. Runtime modules and providers contribute bounded hooks; they must not
install competing `SIGTERM`, `SIGINT`, `uncaughtException`, or
`unhandledRejection` handlers.

Infrastructure such as Kubernetes, systemd, Nomad, or ECS owns process restart
and replica replacement. Nodics owns accurate readiness, traffic draining,
resource cleanup, and recoverable state transitions inside the process.

## States

The runtime preserves `started` as the compatible ready state and supports:

```text
starting -> started -> degraded -> draining -> stopping -> stopped
    |           |          |           |           |
    +-----------+----------+-----------+----------> failed
```

Readiness is available only while the process is `started`. A process enters
`draining` before listeners stop accepting traffic.

## Contributor contract

One process-level contributor represents one owned resource family:

```js
SERVICE.DefaultRuntimeLifecycleService.registerContributor('httpListeners', {
    order: 100,
    timeoutMs: 10000,
    ready: async context => {},
    drain: async context => {},
    shutdown: async context => {}
});
```

- `ready` runs after listeners are accepting traffic. It must not determine
  primary request readiness for optional control-plane integrations.
- `drain` stops new work and allows in-flight work to complete.
- `shutdown` releases connections, timers, consumers, publishers, locks, and
  other owned resources.
- Names are unique, ordering is deterministic, and every hook is bounded.
- Failure of one drain/shutdown contributor is recorded and does not prevent
  later cleanup contributors from running.

## Termination behavior

`SIGTERM` and `SIGINT` initiate one idempotent sequence:

1. Transition to `draining`, making readiness fail.
2. Execute ordered drain contributors.
3. Transition to `stopping`.
4. Execute ordered shutdown contributors.
5. Transition to `stopped` and exit successfully.

Fatal uncaught errors use the same bounded cleanup path but exit unsuccessfully.
OOM `SIGKILL`, host loss, and forced container termination cannot execute hooks;
multiple replicas, stable service endpoints, persisted work ownership, and
external supervision remain mandatory for those failures.

## Performance boundary

Lifecycle and BackOffice registration work is control-plane activity. It must
not execute synchronously in customer request paths. Background contributors
use bounded payloads, timers, timeouts, and retries. BackOffice records logical
service endpoints and runtime instances but never becomes the data-plane proxy
or real-time load balancer.

## Extension sequence

Provider integrations must reuse this lifecycle coordinator. Planned
contributors include internal HTTP clients, MongoDB, Redis, Kafka, ActiveMQ,
search, CronJob/NEMS ownership, and BackOffice registration. Each addition
requires positive, negative, timeout, restart, integration, and regression tests.

## Deployment probe contract

Supervisors use `/nodics/system/v0/health/live` for liveness and
`/nodics/system/v0/health/ready` for traffic readiness. They must not use the
secured readiness-details route as a probe. Termination sends `SIGTERM`, waits
for readiness to become `DOWN`, and allows at least the configured shutdown
deadline plus load-balancer propagation before force termination. With the
default 30-second Nodics deadline, the recommended external grace period is at
least 45 seconds.

OOM kills and hard termination cannot execute cleanup hooks. BackOffice lease
expiry removes stale instances, while cron, event, and workflow recovery remains
owned by their durable state and failover contracts.
