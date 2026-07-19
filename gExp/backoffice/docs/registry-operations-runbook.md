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
operation counters; and last success/error timestamps. It never returns
provider URLs, credentials, keys, stored lease bodies, tokens, or headers.

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

## Rollout Verification

1. Confirm the nCache distributed engine is enabled and ready.
2. Confirm BackOffice readiness reports the registry-store contributor UP.
3. Confirm diagnostics report `mode: distributed` and `available: true`.
4. Restart one module runtime and confirm its old identity is replaced.
5. Kill a disposable runtime without drain and confirm expiry after lease TTL.
6. Restart one BackOffice replica and confirm other replicas retain leases.

Use `npm run test:topology:modular` for governed local registration and CMS
restart reconciliation. Use the guarded Redis live test in an isolated
environment before production release.
