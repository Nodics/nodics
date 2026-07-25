# Assistant Contracts

- Assistant configuration is already merged by the Nodics configuration
  hierarchy before validation. Do not add an Assistant-specific loader.
- Version 1 streaming uses normalized SSE events.
- Provider adapters return the provider-neutral result contract and retain any
  provider-specific continuation data as opaque state.
- Assistant persists only the stable `aiProviders` failure code and sanitized
  category, retry eligibility, and HTTP status. It must never copy raw
  provider errors or credentials into events, turns, logs, or client payloads.
- Tool policy may approve only stable tool, owner-module, and operation
  identities. Resolve executable method, path, and permissions from the current
  employee-filtered BackOffice `/bootstrap` OpenAPI observation for every call.
- Model and browser data must never supply a URL, HTTP method, credential, or
  authorization decision. Read-only employee actions propagate the human bearer
  through `DefaultModuleService`; the target route remains final authorization
  and validation authority. Mutations require explicit confirmation.
- Provider planning uses the strict Assistant-owned JSON envelope, not
  provider-native tool authority. Planning and answer synthesis require
  separate aiProviders idempotency/accounting identities.
- A policy must allowlist top-level target result fields before transient model
  exposure. Never treat byte or token limits as a data-disclosure policy.
- The OOTB `profile.enterprise.search` tool is an example of the required
  ownership split: Assistant approves the logical identity, BackOffice
  re-resolves the current observed contract, and Profile owns the human-only
  permission, exact-filter validation, generated-service query, and safe
  projection. Do not replace it with generic schema CRUD or direct database,
  nSearch, or Elasticsearch access.
- Inline credentials, browser credentials, model self-approval, provider-native
  tools, and fail-open quota enforcement are fixed prohibitions.
- Configuration snapshots must be immutable and must redact secret references.
- AI Assistant owns history, prompt and tool-result optimization only.
  `aiProviders` owns token estimation, reservation, actual usage and cost.
- Assistant-to-Knowledge integration must call
  `DefaultAiKnowledgeOperationsService`; never call the Knowledge retrieval
  implementation, nSearch, Elasticsearch, or Knowledge persistence directly.
- Knowledge scope must be derived from authenticated identity. Preserve the
  immutable evidence and citation package, and label evidence as reference
  data rather than provider instructions.
- Optimization must preserve security instructions, authorization,
  confirmation, tenant/classification, required tool schemas and audit context.
- HTTP routes must remain secured through the existing Profile bearer pipeline
  and action permissions. Never add Assistant authentication middleware.
- Tenant and principal ownership must be derived from authenticated request
  context and applied to every conversation, turn, message, and event query.
- Controllers normalize HTTP input, facades delegate, and the Assistant API
  service coordinates existing authorities. Do not expose generated schema
  routers or provider-specific payloads.
- Generated schema services own update-operator normalization. Assistant
  callers must pass plain partial models and must never wrap them in `$set`.
- Persisted JSON replay and live SSE are separate routes. SSE must publish only
  after persistence, accept only owned replay cursors, bound buffering, clean
  up on disconnect, and expose only normalized Assistant events.
- SSE disconnect never implies business cancellation. Explicit cancellation
  must propagate an AbortSignal through `aiProviders`; uncertain provider usage
  remains governed by the provider ledger.
- Cancellation intent must be persisted from authenticated ownership before
  process-local delivery. Raw browser reason text must not become durable
  operational metadata.
- The lease owner must observe `CANCELLATION_REQUESTED`; completion,
  cancellation, and recovery must use conditional state/owner updates so only
  one terminal event wins.
- Process-local subscribers and execution handles are not durable authority.
  Persisted events and turns support reconnect and distributed recovery.
- A turn must be claimed through a tenant-scoped persisted compare-and-set
  lease before provider execution. nCache is a visibility/coordination
  projection, never a second turn authority.
- Heartbeats may renew only the matching execution owner. Terminal updates
  must include that owner so an expired runtime cannot overwrite its successor.
- Recovery is bounded and service-token protected. Never replay a turn whose
  durable phase reached `PROVIDER`; mark its outcome uncertain and reconcile
  provider evidence instead.
- Execution telemetry must use a fixed counter set without tenant, principal,
  conversation, turn, prompt, model, or provider labels. Persisted turns are
  the tenant-specific diagnostic authority.
- Background execution logs may contain only bounded phase and normalized
  failure diagnostics. Never log employee text, prompts, tool results,
  provider payloads, credentials, or authorization headers.
- Assistant readiness is optional and low disclosure. It may report capability
  degradation but must not block unrelated framework traffic.
- Scheduled recovery must be contributed as inactive CronJob core data and
  invoked with the internal service token. Do not add timers or another
  scheduler inside Assistant.
- CronJob overlap protection is an optimization; persisted recovery
  compare-and-set remains the cross-runtime duplicate-execution boundary.
- Enterprise mutation approval is persisted as `assistantConfirmation`.
  Approval binds employee, tenant, operation, argument digest, expiry, and
  revision. Execution must win an optimistic `APPROVED` to `EXECUTING` claim.
  Completion must compare-and-set `EXECUTING` to `CONSUMED`; changed, expired,
  conflicting, and replayed confirmations must return their governed domain
  status rather than a generic server error.
  Direct execution delegates to Profile using the human bearer; durable
  multi-step execution delegates an active item to Workflow and records the
  returned carrier code.
