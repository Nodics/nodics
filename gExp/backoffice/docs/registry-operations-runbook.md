# BackOffice Registry Operations Runbook

## Production Store Configuration

The BackOffice registry does not create a provider client. Enable a distributed
nCache engine for the `backoffice` module, then select it through layered
BackOffice configuration:

```js
module.exports = {
    backofficeRegistry: {
        store: {
            mode: 'distributed',
            moduleName: 'backoffice',
            engineName: 'redis',
            keyPrefix: 'registry:lease:'
        }
    },
    cache: {
        backoffice: {
            engines: {
                redis: {
                    enabled: true,
                    options: { url: process.env.NODICS_CACHE_REDIS_URL }
                }
            }
        }
    }
};
```

Supply the URL through governed secret or external configuration. Do not commit
credentials, disable TLS verification, or create a BackOffice-owned Redis SDK
connection. Use a deployment-specific key prefix when multiple environments
share infrastructure.

## Readiness and Diagnostics

The configured store contributes a required `backofficeRegistryStore` readiness
check. Distributed mode is unavailable when nCache has no configured engine
client or the provider client reports `isReady === false`.

The secured registry diagnostics response exposes only active module-lease
counts; registration lifecycle counters; store mode and availability; store
operation counters; contract reconciliation and retention counters; bounded
pending-approval and active-selection counts; and last success/error timestamps.
It never returns
provider URLs, credentials, keys, stored lease bodies, tokens, or headers.

Operational assessment reports `READY`, `DEGRADED`, or `NOT_READY` with stable
alert codes. Invalid required configuration or an unavailable registry store is
`NOT_READY`. Failure ratios, queue saturation, store errors, renewal conflicts,
discovery failures, and administrative throttling are `DEGRADED`; they do not
replace the owning subsystem's metrics or target-module health.

Route stable alert codes to the environment monitoring system:

- page for `REGISTRY_STORE_UNAVAILABLE` and configuration failures;
- investigate `REGISTRY_STORE_ERRORS` and `LEASE_RENEWAL_CONFLICTS`;
- scale or tune for `AVAILABILITY_QUEUE_SATURATED`;
- inspect target/runtime health for `AVAILABILITY_FAILURE_RATE`;
- inspect target contracts for `DISCOVERY_FAILURE_RATE`;
- inspect clients and permissions for `ADMIN_REFRESH_THROTTLED`.

## Failure and Recovery

- If BackOffice is unavailable, module traffic remains ready and registration
  retries on `retryIntervalMs`.
- After successful registration, renewal uses `heartbeatIntervalMs`.
- If the distributed store is unavailable, registry operations fail closed and
  BackOffice readiness becomes DOWN; business modules continue their own work.
- Graceful module drain removes all leases for that runtime identity.
- Crash leases disappear through provider TTL even when no sweeper runs.
- BackOffice restart recovers shared leases immediately in distributed mode;
  memory mode reconciles through module retries and heartbeats.
- Contract history always recovers from its durable active pointer. Active reads
  repair stale denormalized `ACTIVE`/`SUPERSEDED` states left by an interrupted
  decision without changing the target module's authoritative contract.

## Rollout Verification

1. Confirm the nCache distributed engine is enabled and ready.
2. Confirm BackOffice readiness reports the registry-store contributor UP.
3. Confirm diagnostics report `mode: distributed` and `available: true`.
4. Restart one module runtime and confirm its old identity is replaced.
5. Kill a disposable runtime without drain and confirm expiry after lease TTL.
6. Restart one BackOffice replica and confirm other replicas retain leases.
7. Confirm the restarted replica reports the same active contract hash and
   activation revision and that reconciliation failures remain zero.
8. Interrupt and restore the distributed provider; confirm BackOffice readiness
   changes without stopping target-module traffic.
9. Confirm operational assessment returns `READY` after recovery and alert/audit
   payloads contain no credentials, endpoints, or provider messages.

Use `npm run test:topology:modular` for governed local registration, CMS restart
reconciliation, and BackOffice durable-pointer restart recovery. Use the guarded
Redis live test in an isolated environment before production release:

```sh
NODICS_CACHE_REDIS_URL=redis://isolated-host:6379 npm run test:backoffice:redis:release
```

The live gate uses a unique key namespace, two independent provider clients,
and scoped cleanup. It validates replica visibility, provider TTL, atomic stale
delete protection, fail-closed interruption, and restored-client recovery. It
does not replace deployment-topology load, TLS, network-policy, or secret
validation.
