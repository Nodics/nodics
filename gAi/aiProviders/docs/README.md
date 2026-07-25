# AI Provider Gateway Foundation

`DefaultAiProviderGatewayService` is the only implemented provider invocation
boundary. Its `execute` operation accepts a profile code and rejects caller
provider/model overrides. The profile resolves to an enabled, registered,
capable adapter.

## Safe provider failures

Provider HTTP failures are normalized before they leave `aiProviders`.
Operational callers receive stable codes such as
`AI_PROVIDER_QUOTA_EXCEEDED`, `AI_PROVIDER_AUTHENTICATION_FAILED`,
`AI_PROVIDER_RATE_LIMITED`, `AI_PROVIDER_TIMEOUT`,
`AI_PROVIDER_UNAVAILABLE`, and `AI_PROVIDER_RESPONSE_INVALID`.

Only the failure category, retry eligibility, and HTTP status may cross into
Assistant events. Provider response messages, response bodies, authorization
headers, credentials, account identifiers, and vendor-specific payloads must
not be persisted or exposed to browser clients. Quota and authentication
failures are not retryable. Rate limits, timeouts, and provider availability
failures may follow the configured retry/fallback policy, with a separate
cost-bearing reservation for every attempt.

## Operational telemetry and readiness

`DefaultAiProviderTelemetryService` records bounded process-local counters for
requests, successes, failures, retries, fallbacks, latency, reconciliation,
overage, and uncertain outcomes. Series labels are limited to configured
profile, normalized capability, and provider code. Tenant, enterprise,
application, principal, prompt, response, and credential values are never
metric dimensions. Once `observability.maximumSeries` is reached, additional
labels enter one overflow series instead of growing memory without a bound.

The secured `GET /operations/ai-providers/diagnostics` endpoint requires
`ai.ledger.read` and returns the sanitized telemetry snapshot plus operational
readiness. Readiness checks effective configuration, registered adapters,
credential resolution, the nCache rate-limit boundary, the token ledger, and
recent normalized provider failures.

AI readiness is registered with nSystem as optional. Missing quota or an
unavailable provider therefore appears as degraded AI capability in secured
readiness details but does not make unrelated Nodics APIs unready. A project
may export these snapshots to its monitoring platform; the process-local
snapshot remains diagnostic rather than billing or audit authority.

## Circuit breaker and fallback

The gateway evaluates a provider circuit before token estimation, reservation,
or network invocation. Circuit state, bounded failure counters, and half-open
probe permits use the configured nCache `circuitBreaker` channel. There is no
provider-local circuit store. An environment may select a distributed nCache
engine when several Nodics instances must share circuit state.

The configurable policy contains:

- `failureThreshold`: failures permitted in one sampling window;
- `samplingWindowSeconds`: lifetime of the bounded failure counter;
- `openSeconds`: period during which calls skip the provider;
- `halfOpenMaximumCalls`: concurrent probes allowed after the open period;
- `halfOpenProbeSeconds`: bounded lifetime of probe permits.

An open circuit is a safe retryable routing signal. If the usage profile has
configured fallbacks and fallback is enabled, the gateway skips reservation
for the open provider and evaluates the next candidate. Every provider that is
actually invoked receives its own idempotent token reservation and accounting
outcome. Circuit-skipped providers are not reported as attempted providers and
do not consume token capacity. A successful half-open call closes the circuit;
a failed probe reopens it.

`DefaultAiProviderConfigurationService` validates the already-merged
configuration and is not a second loader. Enabled providers require secret
references; inline credentials are rejected and snapshots redact references.
`env://OPENAI_API_KEY` is a supported backend-process reference for local
qualification. Production projects should normally replace it with their
injected vault resolver without changing provider or caller code.

Fallback is disabled by default. Provider adapters, normalized streaming,
secret resolution, retry/fallback accounting, provider-evidence lookup,
read-only nCache acceleration, and usage alerts are implemented and remain
governed by effective configuration.

Exact token planning, persistent budget windows, CAS reservation, immutable
usage evidence, reconciliation, release, uncertainty, and expiry are implemented in the
[token economics contract](token-economics-and-optimization.md).

For business use cases, administration, APIs, lifecycle, partner customization,
security, scale, deployment, backup/restore, and troubleshooting, read the
[Persistent AI Token Ledger Guide](persistent-token-ledger-guide.md).
