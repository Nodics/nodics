# AI Providers

`aiProviders` is the executable, provider-neutral gateway for every Nodics AI
caller. It currently implements version 1 generation and embedding contracts,
fail-closed configuration validation, secret-safe snapshots, adapter
registration, usage-profile resolution, capability validation, and normalized
gateway execution. Layered global and scoped emergency stops plus an atomic
nCache-backed request limiter protect provider invocation.

The module owns the persistent AI schemas, while persistence execution remains
owned by the Nodics framework. Build-time generation creates the standard
`DefaultAiToken*Service` services. Runtime code calls those generated services,
which resolve tenant-scoped models and execute the normal nService/nDatabase
pipelines. AI code must not connect to MongoDB or any other database directly.

`aiTokenBudget` explicitly opts into provider-neutral nDatabase transactions.
Its cache and event side effects are disabled because side effects emitted by a
generated pipeline cannot be considered committed until the database
transaction commits. Other AI ledger schemas remain outside the transaction
unless they independently satisfy the same schema contract.

`DefaultAiTokenLedgerRepositoryService` is a domain persistence-orchestration
helper, following established Nodics repository-service patterns. It may
coordinate generated AI schema services and provider-neutral nDatabase
transactions, but it is not a database adapter. Projects must not put MongoDB,
Cassandra, or other provider-specific behavior in this service.

Token economics and optimization are mandatory. See
[AI Token Economics and Optimization](docs/token-economics-and-optimization.md)
and the beginner-to-expert
[Persistent AI Token Ledger Guide](docs/persistent-token-ledger-guide.md).

OpenAI Responses, Anthropic Messages, and Google Gemini/Vertex AI adapters are
implemented as disabled provider modules. Each adapter owns only vendor
translation, conservative estimation, cancellation, normalized streaming
deltas, and normalized usage. Selection, credentials, pricing, reservations,
retry/fallback, caching, rate limits, and kill switches remain parent gateway
responsibilities.

Real network execution remains disabled until a project or environment
activates a provider, selects it through a usage profile, supplies reviewed
exact pricing, and configures an opaque backend secret reference. The existing
credential authority supports injected vault resolvers and validated
`env://VARIABLE_NAME` references. Environment resolution is intended for local
or governed process environments; credential values never enter configuration,
snapshots, logs, or browser responses. Standard tests use mocked transports and
never require or print credentials.

Callers provide a usage-profile code, normalized operation, request, and
governed context. They cannot provide a provider or model. An adapter is
selectable only when its module is active, it is registered, its configuration
is enabled, and it supports the requested capability.

Operational telemetry is bounded, sanitized, and process-local. The secured
provider diagnostics API reports readiness and request outcomes without
prompts, responses, credentials, or user-controlled metric labels. AI is an
optional nSystem readiness contributor, so provider degradation does not stop
unrelated backend capabilities.

Provider circuit state and half-open probes use the configured nCache
authority. Open providers are skipped before reservation, allowing configured
fallbacks to run without charging capacity to a provider that was not invoked.

Run:

```text
node gAi/aiProviders/test/aiProviderGatewayContract.test.js
node gAi/aiProviders/test/aiTokenEconomicsContract.test.js
node gAi/aiProviders/test/aiPersistentTokenLedgerContract.test.js
node gAi/aiProviders/test/aiProviderOperationalControlsContract.test.js
```
