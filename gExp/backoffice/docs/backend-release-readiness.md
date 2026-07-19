# BackOffice Backend Release Readiness

## Release boundary

This checklist covers the BackOffice backend capability only. Nodics Axis and
other frontend code remain a separate future application and release stream.
Target modules remain responsible for their APIs, authorization, health, and
business data.

## Environment configuration

Production-like environment modules should override reusable defaults through
the existing `envs` hierarchy. A typical policy requires distributed leases and
tunes workload-specific thresholds without embedding provider secrets:

```js
module.exports = {
    backofficeRegistry: {
        audit: {
            enabled: true,
            failClosed: true,
            requireAcknowledgement: true,
            publisherService: 'EnvironmentBackofficeAuditPublisher'
        },
        store: {
            mode: 'distributed',
            moduleName: 'backoffice',
            engineName: 'redis',
            keyPrefix: 'replace-with-environment-owned-prefix:'
        },
        operations: {
            requireDistributedStore: true,
            production: {
                enabled: true,
                requireHttpsOnly: true,
                requireHostAllowlists: true,
                requireStrictAudit: true,
                requireStrictAlerts: true
            },
            alerts: {
                enabled: true,
                failClosed: true,
                requireAcknowledgement: true,
                publisherService: 'EnvironmentBackofficeAlertPublisher'
            },
            minimumSamples: 20,
            thresholds: {
                availabilityFailurePercent: 20,
                availabilityQueuePercent: 70,
                discoveryFailurePercent: 20,
                storeErrors: 1,
                conditionalDeleteConflicts: 10,
                refreshThrottles: 1
            }
        }
    }
};
```

Production configuration must also set strict acknowledged audit delivery and
environment-owned discovery/availability host allowlists. Publisher service
names are extension points implemented by the environment integration module;
BackOffice does not own a second monitoring transport.

Provider URLs and credentials belong in governed secret/external configuration.
Validate lease/sweep, readiness timeout/freshness, probe concurrency/queue,
failure backoff, administrative rate/idempotency, audit, and contract-retention
settings against the expected replica and module count.

## Go-live gates

1. Run `npm run release:check -- --execute --full` from a clean candidate.
2. Generate and validate BackOffice OpenAPI and module LLM context.
3. Prove the configured distributed store and atomic conditional delete support.
4. Verify readiness contributors for registry store and operational policy.
5. Verify human/service identity separation and every permission in the matrix.
6. Exercise module crash expiry, rolling module restart, BackOffice replica
   restart, provider interruption/recovery, and active contract reconstruction.
7. Confirm diagnostics show `READY` with no unexplained alert codes.
8. Run environment-sized registration, renewal, probe, scan, and refresh load.
9. Confirm alert routing and sanitized audit delivery.
10. Record accepted residual risks, owners, and rollback decision authority.

## Rollback

Roll back application replicas using the deployment platform while preserving
the distributed lease namespace and durable contract database. Do not delete
leases or contract history as part of binary rollback. If a new deployment
changed configuration only, restore the previous environment-layer revision and
roll replicas. Confirm atomic lease renewal, active contract hash/revision,
readiness, diagnostics, and module registration recovery before closing the
incident.

## Current residual risks

- Real provider throughput and latency depend on the selected nCache engine and
  deployment topology and require environment-owned load evidence.
- Alert delivery depends on the configured monitoring/audit integration.
- Frontend usability, browser security, and direct-module client behavior remain
  unvalidated until the separate Nodics Axis workstream begins.
