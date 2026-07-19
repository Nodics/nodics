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

The request uses the registered endpoint's exact origin and the configured
relative health path. It shares discovery's scheme, credential, fragment, and
host validation; redirects, timeout, response-size, refresh, freshness, and
optional host-allowlist policy are layered configuration. Only public,
low-disclosure readiness is called, without a human or internal token.

BackOffice retains only instance ID, normalized state, timestamps, and a stable
failure code. It never retains or returns raw health responses, checks,
credentials, endpoints in diagnostics, stack traces, or provider details.

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

Secured registry diagnostics expose only tracked/inflight counts, attempts,
successes, failures, transitions, stable last-failure code, and timestamps.

## Required validation

Changes require tests for success, negative readiness, transport failure,
timeout bounds, response bounds, redirect and host policy, deduplication,
freshness expiry, removal, multi-instance aggregation, recovery fallback,
sanitized diagnostics, module restart, BackOffice restart, and consolidated and
modular topologies.
