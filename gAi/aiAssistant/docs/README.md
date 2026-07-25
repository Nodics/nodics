# Assistant Configuration Foundation

The implemented foundation is intentionally fail closed. `aiAssistant.enabled`
defaults to `false`, tools default to deny, and provider-native tools cannot be
enabled. AI Assistant stores only an `aiProviders` usage-profile code.

Projects customize values through Nodics configuration layering. The
`DefaultAiAssistantConfigurationService` validates the already-merged effective
configuration; it is not a second loader or configuration authority. Its
snapshot records effective values and optional origins while replacing secret
references with a non-sensitive marker.

Provider selection and credentials are not Assistant configuration. Generated
persistence and the employee-secured JSON route boundary are implemented.
`api.maximumPageSize` and `api.maximumEventReplaySize` bound reads. The
`aiAssistant` API exposure category is disabled by framework default and enabled
for the local Startio environment. Live SSE delivery and the read-only tool
execution boundary are implemented. Tool execution remains disabled until both
the effective `tools.enabled` setting and a reviewed persisted policy are active.

`contextOptimization` configures bounded history and tool-result policies.
These policies may reduce semantic context but must preserve security,
authorization and confirmation information. Provider token/cost accounting
remains solely in `aiProviders`.

## Secured route behavior

Every Assistant route uses the standard Nodics request pipeline and requires a
Profile-issued bearer identity plus its action permission:

- `ai.assistant.use` creates conversations and submits turns;
- `ai.assistant.read` lists/loads conversations, loads turns, and replays
  persisted events;
- `ai.assistant.cancel` cancels only a turn still in `ACCEPTED`.

The tenant and principal come from the authenticated request. Request bodies
cannot choose either value. Customer identities, module identities, another
employee's identifiers, cross-tenant identifiers, unknown records, and
unpermitted actions fail closed.

The browser also cannot select a prompt, provider, or model. Conversation
creation validates an enabled Assistant Definition; turn submission reloads
that definition and uses its approved prompt and provider-profile codes.

## Governed read-only tools

An Assistant Definition references one persisted `assistantToolPolicy`. A policy
approves stable `toolId`, owning module, operation ID, read mode, and minimum
permissions; it does not store an executable URL. The OOTB
`axisAssistantReadOnly` policy is imported inactive, so an init import does not
activate tool access.

The policy currently declares two reads. `backoffice.catalogue.read` verifies
the discovery bridge. `profile.enterprise.search` is the first target-owned
business capability. It maps to `profile_searchenterprises` and permits only
exact scalar enterprise filters with bounded pagination. Profile performs the
query through its generated enterprise service and returns a safe projection;
Assistant does not query an enterprise schema, database, or search engine
directly.

Immediately before a call, Assistant obtains the employee-filtered BackOffice
bootstrap from the authoritative secured `/backoffice/v0/bootstrap` route and
resolves the approved operation against the current normalized
OpenAPI observation. The observed target contract supplies the method, path,
and current permissions. Only `GET`, `HEAD`, and `OPTIONS` are accepted in this
phase. Missing operations, permission drift, mutation drift, malformed paths,
unknown path parameters, oversized arguments, and oversized results fail
closed.

The employee bearer token and enterprise header are forwarded through
`DefaultModuleService`. The target module's normal router pipeline performs
final authentication, authorization, validation, and business processing.
Assistant never substitutes its own permission decision or an internal token.
It records the tool identity, lifecycle outcome, result size, and bounded
top-level result keys; returned business data remains transient and is not
copied into turn events.

The provider receives a bounded logical catalogue containing tool identity,
description, required path-parameter names, and policy-owned input schema. It
does not receive executable paths, methods, credentials, or authorization
headers. Because provider-native tools are prohibited, the planning response
must be exactly one Assistant-owned JSON envelope: either `ANSWER` or one
`TOOL_CALL`. Markdown, surrounding prose, unknown fields, oversized JSON, and
invented identities fail closed.

After a valid tool call, the policy's `resultFields` allowlist projects the
target response before it enters provider context. Bounds do not replace this
disclosure policy. The projected result is labeled as untrusted business data,
then a second provider generation creates the employee-facing answer. Planning
and answer generations use separate idempotency suffixes and are independently
reserved and reconciled by `aiProviders`; both usage phases are persisted.

Provider failures remain provider-neutral. A failed turn stores a stable
failure code and may stream a sanitized `providerFailure` object containing
only `category`, `retryable`, and HTTP `status`. Axis can use these fields to
show an actionable message such as quota unavailable or provider temporarily
unavailable. It must not receive or display raw provider response text,
credentials, authorization headers, billing identifiers, or vendor payloads.
Server logs record only the bounded execution phase, normalized code, error
class, and a capped diagnostic message. They never include the employee
message, prompt, tool result, provider payload, or credential.

The module contributes the enabled `axisAssistant` definition and the active
version 1 `axisAssistantReadOnly` prompt as initializer data. They are not
written during ordinary server startup. An operator with `import.init.run`
imports them through the standard init-data API; the header queries make repeat
imports idempotent. Runtime configuration administrators receive
`ai.assistant.use`, `ai.assistant.read`, `ai.assistant.cancel`, and
`ai.assistant.operations.read` through the normal Profile user-group import.

The replay endpoint remains JSON pagination over persisted events. The separate
`/stream` endpoint uses `text/event-stream`, persists before publishing,
replays missed events, supports `Last-Event-ID`, sends configurable heartbeats,
and removes process-local subscribers on disconnect. A reconnect gap outside
the durable replay window fails with HTTP 410.

Turn submission returns HTTP 202 after durable acceptance and continues in the
background. Active cancellation aborts the provider signal and persists a
terminal cancellation event. Disconnecting an SSE client does not cancel the
turn; this permits safe reconnect. Process-local fan-out is only a delivery
optimization—persisted events remain authoritative for recovery and distributed
instances.

Cancellation is durable before delivery. The owning employee's request changes
an accepted turn directly to `CANCELLED`, or changes an executing turn to
`CANCELLATION_REQUESTED`. The persisted record stores the authenticated
principal, timestamp, and stable `EMPLOYEE_REQUEST` reason; arbitrary browser
reason text is not persisted. A matching process-local coordinator may abort
immediately, while a remote lease owner observes the same intent during its
heartbeat and propagates the existing AbortSignal to aiProviders.

Repeated requests return the current state without adding duplicate terminal
events. Completion and cancellation use conditional owner/state updates, so
only one terminal outcome wins. If the provider already completed, its known
usage remains reconciled. If provider completion is uncertain, aiProviders
retains uncertain accounting. Recovery converts an expired
`CANCELLATION_REQUESTED` turn to exactly one `CANCELLED` event and never
replays the provider.

Execution ownership is not process-local. A conditional generated-service
update changes one `ACCEPTED` turn to `PROCESSING`, records the runtime owner,
phase, heartbeat, and bounded lease expiry, and permits only one runtime to
win. The same lease is projected through the configured
`aiAssistant.executionLease` nCache channel for fast visibility; the persisted
turn remains authoritative if cache is unavailable. Distributed environments
must configure that channel with a distributed nCache engine such as Redis or
Hazelcast. The local engine is suitable only for monoServer development.

`POST /internal/assistant/turns/recover` is service-token protected and scans
only a configured bounded tenant batch. It terminalizes old `ACCEPTED` turns
as retry-required. It also terminalizes expired `PROCESSING` turns. When the
last durable phase is `PROVIDER`, the result is
`AI_ASSISTANT_PROVIDER_OUTCOME_UNCERTAIN`; recovery does not invoke the
provider again because the first call may already have incurred cost or side
effects. Operators reconcile provider usage evidence before deciding whether
the employee should submit a new idempotent turn.

## Operations visibility

An operator with `ai.assistant.operations.read` may call
`GET /operations/ai-assistant/diagnostics`. The response combines optional
Assistant execution readiness with process-local counters for claims,
conflicts, renewals, heartbeat failures, cache projection failures, recovery,
retry-required outcomes, uncertain provider outcomes, cancellation requests,
signals, and recovered cancellations.

These counters deliberately have no tenant, employee, conversation, turn,
prompt, model, or provider labels. This prevents sensitive disclosure and
unbounded metric cardinality. Durable turn records remain the source for
tenant-specific investigation; the diagnostics endpoint is a sanitized
operational signal, not an audit store.

Assistant registers an optional `aiAssistantExecution` contributor with
nSystem. Invalid configuration, missing turn persistence, missing execution
cache, or a recent heartbeat failure reports degraded capability. Because
Assistant is optional and disabled by default, this contributor does not make
unrelated Nodics traffic unready.

## Scheduled recovery

Core import contributes `aiAssistantTurnRecoveryJob` to the existing CronJob
schema. It is inactive and does not run during ordinary server startup. An
operator must first run the normal core import, review the definition, and then
explicitly activate/create/start it through CronJob.

The OOTB definition is assigned to `node0`, runs every two minutes when active,
uses a 30-second internal-call timeout, and invokes
`POST /internal/assistant/turns/recover` with the tenant-scoped internal token.
The recovery batch defaults to `aiAssistant.execution.recoveryBatchSize`.
Operators may change the persisted Cron expression, assigned node, timeout,
logging, and active state for their environment; batch and lease behavior use
normal Nodics configuration layering.

CronJob's runtime running flag prevents overlapping ticks on the owning
process. Node placement and failover remain CronJob responsibilities. If two
runtimes nevertheless scan the same candidate after a failure or network
partition, the Assistant persisted compare-and-set permits only one recovery
claim. An empty scan succeeds without changing data. Provider-phase turns
remain uncertain and are never replayed automatically.

## Governed Knowledge context

When a turn supplies `knowledge`, Assistant emits a `KNOWLEDGE_RETRIEVAL`
status and delegates the request to AI Knowledge's operations service. Assistant
does not call nSearch, Elasticsearch, a generated Knowledge model, or a source
module directly.

The tenant, enterprise, and application scope come from the authenticated
employee context. A browser-supplied tenant is ignored. The caller may select
only the declared corpus, audience, classifications, query, locale, retrieval
mode, search mode, and bounded result count; AI Knowledge validates those
values and filters against the active corpus version.

The returned context is immutable and provider-neutral. It contains evidence,
citations, retrieval metadata, and an estimated evidence-token count. Evidence
is appended to the approved provider instructions as explicitly untrusted
reference data. This keeps citation identity visible to OpenAI, Anthropic, and
Gemini without adding provider-specific prompt paths.

If Knowledge is unavailable, the corpus has no active version, the scope is
invalid, or governed evidence is required but insufficient, the turn fails
closed and persists a terminal failure event. A project may override the
Assistant context adapter to add presentation metadata, but it must continue
delegating retrieval to AI Knowledge and must preserve scope, evidence, and
citations.
