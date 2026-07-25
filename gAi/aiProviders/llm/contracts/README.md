# AI Provider Contracts

- Callers identify a usage profile, never a provider or model.
- Profiles select only enabled, registered adapters supporting the required
  normalized capability.
- Individual providers register themselves and cannot select themselves.
- Provider failures must be normalized by `aiProviders` into stable,
  provider-neutral codes. Never persist or expose raw provider messages,
  bodies, headers, credentials, or account details.
- Only sanitized category, retry eligibility, and HTTP status may cross the
  gateway diagnostics boundary. Quota and authentication failures are
  non-retryable.
- Provider telemetry is bounded and process-local. Labels may contain only
  configured profile, normalized capability, and provider code. Never use
  tenant, enterprise, application, principal, prompt, response, credential, or
  arbitrary caller input as a metric dimension.
- AI provider readiness is an optional nSystem contributor. Provider
  degradation must remain visible without taking unrelated Nodics traffic out
  of service.
- Circuit state, failure windows, and half-open permits belong in nCache.
  Never add a provider-local or unbounded circuit map.
- Check circuit state before estimation, reservation, and invocation. A
  circuit-skipped provider consumes no token capacity and is not an attempted
  provider. Every real retry or fallback invocation requires an independent
  reservation and reconciliation outcome.
- Provider-neutral generation, embedding, usage, errors, and continuation state
  belong here rather than in Assistant or Knowledge.
- Inline credentials and caller provider/model overrides are prohibited.
- Environment credentials may be referenced only as
  `env://UPPERCASE_VARIABLE_NAME` and resolved inside the backend credential
  authority. Never read environment secrets in Assistant, Knowledge, adapters,
  frontend code, or configuration modules.
- Fallback is disabled by default.
- Every invocation requires provider estimation, exact configured pricing,
  immutable planning, idempotent atomic reservation, normalized actual usage,
  exact reconciliation and release on failure.
- Token counts are safe integers and cost values are exact decimal strings.
  Floating-point cost decisions are prohibited.
- Retries and fallbacks are separately accountable cost-bearing attempts.
- Assistant and Knowledge optimize semantic input but never own the provider
  usage ledger or charge cost.
- Persistent budget, reservation, and usage models are authoritative. Use
  revision-guarded CAS or stronger database transactions; cache is never a
  capacity-decision authority.
- Repository adapters must interpret the standard generated-service response
  envelope, including affected-count metadata nested under `result`; never
  retry a successful CAS because only the outer response object was inspected.
- Tenant scope and authenticated principal context must be derived by the
  ledger. Usage evidence is immutable and uncertain usage remains reserved.
- Extend lifecycle behavior through `DefaultAiTokenLedgerService` and its
  repository port. Never expose generated CRUD for ledger models.
- Schedule repair through CronJob's authenticated internal-module call. Keep
  scan, finding, reconstruction, and reconciliation logic in `aiProviders`.
- Repair is bounded, idempotent, service-token-only, and dry-run first.
  Transitional recovery reconstructs exact counters from evidence.
- Never release `UNCERTAIN` capacity from absence, timeout, caller assertion, or
  negative lookup alone. Positive provider usage evidence may reconcile it.
- Read `../../docs/token-economics-and-optimization.md` before extending a
  provider, optimizer, cache policy, quota, ledger, retry or fallback.
