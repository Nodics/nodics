# AI Providers Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../AGENTS.md`.
- Follow the `gAi` contract: `../AGENTS.md`.
- Follow global guidance: `../../gSetup/llm/ai-enablement-index.md`.

## Capability Boundary

- `aiProviders` owns its AI budget, reservation, usage, and repair schemas.
  Those schemas must be exported under the `aiProviders` module key so standard
  Nodics model and service generation preserves module ownership.
- AI services must persist through generated schema services and standard
  database pipelines. They must never import a database driver, open a
  connection, or implement an AI-local persistence abstraction.
- `aiProviders` is the only gateway callers use for generation, embeddings, and
  future model capabilities.
- It owns provider-neutral contracts, adapter registration, usage-profile
  selection, capability validation, normalization, resilience policy, secret
  reference boundaries, diagnostics, and provider conformance tests.
- Individual provider modules own SDK and protocol translation only. They may
  register supported capabilities but cannot select themselves.
- Callers supply a configured usage-profile code, never a vendor name, model
  endpoint, credential, or vendor adapter service.
- Profiles and providers are layered configuration. Active modules decide
  which adapter code exists; configuration cannot activate an absent adapter.
- Reject inline secrets, direct caller provider overrides, unsupported
  capabilities, disabled providers, and unregistered providers.
- Reject provider execution without provider-specific estimation, configured
  exact pricing, an idempotent atomic reservation, and a ledger capable of
  reconciling normalized actual usage.
- Evaluate global, tenant, enterprise, application, principal, profile,
  provider, model, and capability emergency stops before estimation or
  invocation. Repair operations remain separately authorized and must not be
  disabled by an invocation kill switch.
- Enforce request limits through nCache's atomic bounded-increment contract.
  Never implement distributed rate limits with non-atomic cache get/put, and
  fail closed when the configured rate-limit channel is unavailable.
- Keep request-rate authority separate from spend authority: nCache protects
  traffic windows, while the persistent token ledger alone approves cost and
  token capacity.
- Represent token counts as non-negative safe integers and money as canonical
  exact decimal strings. Use BigInt arithmetic with explicit conservative
  rounding; JavaScript floating point is prohibited for AI cost decisions.
- Normalize input, output, cached-input, reasoning, and embedding categories
  when supported, retaining honest absence rather than inventing provider data.
- Pricing revisions, currency, token budgets, cost ceilings, retry/fallback
  eligibility, caching, and optimization strategies are layered configuration.
- A retry or fallback is a new cost-bearing attempt and must be budgeted and
  accounted for. Never hide retry cost inside the original usage record.
- Release reservations only when provider invocation did not start. A timeout,
  disconnect or malformed response after invocation is uncertain usage and
  must remain reserved for repair/reconciliation; never release it as free.
- Persistent `aiTokenBudget`, `aiTokenReservation`, and `aiTokenUsageRecord`
  models are authoritative. Cache data is diagnostic acceleration only and
  must never approve a reservation or decide remaining capacity.
- Scope every budget, reservation, usage query, idempotency identity, and
  administrative operation by the authenticated tenant. Caller-supplied tenant,
  provider, model, price, or principal values are never authoritative.
- Reserve capacity with revision-guarded compare-and-swap, bounded retries, and
  exact arithmetic. A customization may use a database transaction, but may
  not replace concurrency control with read-then-write arithmetic.
- Hierarchical budgets must mutate every participating account atomically.
  Deterministic ordering or compensating writes alone do not constitute this
  guarantee. Enable `ledger.budget.hierarchy` only with a qualified repository
  that truthfully advertises `atomicBudgetHierarchy`; otherwise fail closed.
- A schema used inside a provider-neutral nDatabase transaction must opt in with
  `transaction.enabled: true`, declare `transaction.sideEffects: 'none'`, and
  disable cache and event side effects. This prevents generated pipeline side
  effects from escaping before the transaction commits.
- Store every participating `budgetCode` on reservation and usage evidence.
  Reconcile, release, expire, and repair the complete sorted account set.
- Usage records are immutable audit evidence. Generated model CRUD, direct
  deletion, and lifecycle updates outside `DefaultAiTokenLedgerService` must
  remain disabled.
- Transitional states must be repairable. Never convert `UNCERTAIN` to free
  capacity without provider evidence or governed human reconciliation.
- Repair scans are service-token-only, bounded, idempotent, persistent, and
  dry-run by default. CronJob may schedule the internal repair API but never
  owns repair state or ledger mutation.
- `RELEASING` and `RECONCILING` recovery must reconstruct exact budget counters
  from reservation and immutable usage evidence. Never guess by incrementing
  or decrementing stale counters.
- `UNCERTAIN` reconciliation requires positive provider usage evidence and the
  original pricing revision. Missing or negative lookup evidence cannot release
  capacity.
- Repair metrics are sanitized process-local diagnostics. Repair runs,
  findings, reservations, budgets, and usage records remain persistent audit
  authority.
- Use nCache for prompt, response, and embedding cache storage. Do not create a
  provider-local or AI-specific cache engine.
- Do not duplicate Assistant orchestration, Knowledge ingestion, nSearch,
  Workflow, target-module authorization, quota ledgers, or business behavior.
- Employee self-service usage reporting must query the persistent ledger with
  tenant and authenticated human principal fixed by server identity. Its
  client-safe projection must omit provider/model identities, record and
  reservation identifiers, and arbitrary caller scope overrides; exact cost
  totals remain grouped by currency.
