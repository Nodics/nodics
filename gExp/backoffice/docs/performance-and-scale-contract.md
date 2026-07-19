# BackOffice Performance and Scale Contract

## Approach

Core Nodics performance gates use deterministic path and operation-count
budgets, plus timing evidence. They do not enforce machine-specific latency
thresholds. Projects and deployment environments may increase workloads and add
real distributed-provider load tests through later configuration layers.

Defaults live under `backofficeRegistry.benchmark` and cover registration batch
size, lease inventory size, hosted modules per runtime, concurrent idempotent
refreshes, administrative result/page scans, readiness probes per runtime, and
refresh executions per idempotency key.

## Protected fast paths

- Registration persists the bounded module batch but never awaits discovery or
  readiness observation.
- Modules hosted by one runtime share one readiness probe.
- Process-wide readiness work uses configurable active and queued ceilings.
- Unavailable targets use a configurable refresh backoff.
- Queue overflow fails open for registration and application traffic and is
  visible through sanitized diagnostics.
- Administrative inventory returns at most 100 entries and stays within the
  configured store-scan budget.
- Concurrent refresh requests with one idempotency key execute the underlying
  refresh once.

## Evidence and deployment tests

`backofficePerformanceContract.test.js` prints sanitized workload and elapsed
timing evidence while enforcing structural budgets. Release environments should
add sustained registration/renewal, real distributed-store, slow readiness,
replica restart, and store degradation tests sized for their topology. Raw
endpoints, credentials, tenant data, or provider diagnostics must not appear in
reports.

The guarded Redis release gate accepts environment-owned live workload budgets:

```sh
NODICS_CACHE_REDIS_URL=redis://isolated-host:6379 \
NODICS_BACKOFFICE_LOAD_LEASES=5000 \
NODICS_BACKOFFICE_LOAD_CONCURRENCY=64 \
NODICS_BACKOFFICE_LOAD_MAX_MS=30000 \
npm run test:backoffice:redis:release
```

The gate fails when values are not positive integers, the latency budget is
exceeded, or the second provider client cannot scan the complete workload.
Environment owners must size these values from expected module instances,
replicas, renewal frequency, and recovery bursts.
