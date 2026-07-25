# BackOffice Availability Observation Contract

## Authority and purpose

Target modules and Nodics System remain authoritative for runtime health and
readiness. BackOffice observes the existing low-disclosure public readiness
contract and provides a freshness-bounded client summary. It does not add a
second health endpoint, execute provider-specific checks, alter target
readiness, or make module traffic readiness depend on BackOffice.

An active lease proves only that a runtime recently registered. It is not a
health result. Likewise, a failed BackOffice observation does not stop or
restart the target runtime.

## Collection and security

Availability collection is asynchronous to registration. Registrations from
the same runtime instance are deduplicated, so one process readiness endpoint
is not polled once for every hosted module. Periodic registration renewal
triggers bounded refresh according to `backofficeRegistry.availability`.
After a failed observation, the first renewal may retry after
`failureRetryIntervalMs`; repeated failures use `failureBackoffMultiplier` up
to `maxFailureBackoffMs`. This allows a runtime whose readiness becomes `UP`
just after registration to recover promptly without creating an unbounded
polling loop. Successful observations return to the normal
`refreshIntervalMs` cadence.

Example layered configuration:

```js
backofficeRegistry: {
    availability: {
        refreshIntervalMs: 10000,
        failureRetryIntervalMs: 5000,
        failureBackoffMultiplier: 2,
        maxFailureBackoffMs: 60000
    }
}
```

The example retries the first failed observation after five seconds. Continued
failure increases the interval without exceeding sixty seconds. Projects
customize these values in the applicable project, environment, server, node,
tenant, or customer `properties.js` layer; they must not add a second polling
service or health authority.

The request uses the registered endpoint's exact origin and the configured
relative health path. It shares discovery's scheme, credential, fragment, and
host validation; redirects, timeout, response-size, refresh, freshness, and
optional host-allowlist policy are layered configuration. Only public,
low-disclosure readiness is called, without a human or internal token.

BackOffice retains only module/instance identity, normalized state, timestamps,
and a stable failure code. It never retains or returns raw health responses, checks,
credentials, endpoints in diagnostics, stack traces, or provider details.

## Operational transitions and metrics

The observer emits an operational event only when a module's aggregate state
changes. Initial-state publication is disabled by default to
avoid deployment and restart event storms, and repeated identical results are
deduplicated. Recovery is a transition and is emitted once. Event publication
is asynchronous to registration and application traffic and fails open.

`backofficeRegistry.availability.events` controls publication, initial-state
behavior, the existing Nodics publisher service, event name, target, and type.
The default publisher is `DefaultEventService`; projects may replace the
publisher through normal layered service and configuration overrides. This is
an observability bridge over the normalized observation, not another health or
event authority.

Event data is limited to module and runtime identity, environment/server/node
coordinates supplied by authenticated registration, previous/current state,
stable reason code, and observation time. It excludes endpoint, credentials,
raw readiness content, stack traces, and transport/provider messages.

Diagnostics include attempts and outcomes, readiness versus transport failure,
timeouts, stale reads, suppressed refreshes, in-flight deduplication, state
transitions, publication outcomes, and bounded probe-duration aggregates.
These process-local operational counters may be exported by a governed
observability integration; they are not billing or durable audit authority.

## State and aggregation

An instance observation is `UP` only when the target readiness contract reports
`UP`. A negative response or bounded transport failure is `UNAVAILABLE`. A
missing or stale observation is `UNKNOWN`.

Module state across currently leased instances is:

- `UP` when every instance is freshly up;
- `DEGRADED` when at least one instance is up and another is unavailable or
  unknown;
- `UNAVAILABLE` when every fresh observation is unavailable;
- `UNKNOWN` when no reliable fresh conclusion exists.

Responses include counts of active, healthy, unavailable, and unknown
instances, but no private per-instance diagnostic payload. UI-composition
selection accepts only an `UP` or `DEGRADED` provider; otherwise bootstrap uses
the static recovery-shell fallback.

## Lifecycle and diagnostics

Observations disappear after the final lease for a runtime instance is removed
or expires. BackOffice restart begins with `UNKNOWN` process cache and rebuilds
fresh observations through registration reconciliation. This is intentionally
different from durable contract history.

Secured registry diagnostics expose only tracked/inflight counts, bounded
operational counters, stable last-failure code, and timestamps.

## Operator troubleshooting

If a module remains `UNAVAILABLE`:

1. call the target runtime's public `/nodics/system/v0/health/ready` endpoint;
2. confirm that the registered origin and health path belong to that runtime;
3. compare `failureRetryIntervalMs`, failure backoff, freshness, lease, and
   registration heartbeat settings;
4. inspect secured BackOffice diagnostics for the stable readiness or transport
   failure category;
5. correct the target dependency or configuration and allow the existing
   registration renewal to trigger recovery.

Do not mark a module healthy manually and do not create a second registry
record. A readiness response of `DOWN` is resolved at the target runtime. A
transport failure is resolved through endpoint, network, TLS, allowlist, or
deployment configuration. BackOffice publishes one recovery transition when
the normalized aggregate returns to `UP` or `DEGRADED`.

## Required validation

Changes require tests for success, negative readiness, transport failure,
timeout bounds, response bounds, redirect and host policy, deduplication,
freshness expiry, removal, multi-instance aggregation, recovery fallback,
sanitized transition publication and deduplication, publication failure,
sanitized diagnostics, module restart, BackOffice restart, and consolidated and
modular topologies.
