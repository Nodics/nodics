# AI Assistant

AI Assistant is the reusable Nodics backend boundary for conversational
orchestration. The implemented governed vertical slice owns persisted
definitions, conversations, messages, turns, replay events, approved prompts,
employee identity enforcement, configurable redaction, bounded context, and
provider-neutral turn orchestration, and an employee-secured HTTP application
boundary for conversations, turns, persisted event replay, and durable
distributed cancellation.

Assistant calls only `aiProviders`; it never imports a vendor adapter. It may
retrieve citation evidence only through AI Knowledge. It remains disabled by
default. The JSON APIs and live normalized SSE delivery are implemented;
the governed read-only tool execution boundary is implemented but disabled by
default. The provider-neutral single-tool planning and answer-synthesis loop is
implemented. Enterprise creation uses a separate immutable employee
confirmation API; Profile remains mutation authority and Workflow owns
configured durable multi-step execution.

## Current contracts

- conversation context and start-turn request;
- normalized SSE event types;
- persisted definition-owned tool policies and current BackOffice-observed
  module operation contracts;
- bounded read-only execution through `DefaultModuleService`, with employee
  bearer propagation and final target-route authorization;
- sanitized `TOOL_PLAN`, `TOOL_STARTED`, and `TOOL_RESULT` lifecycle evidence
  that never persists returned business data;
- strict JSON-only `ANSWER` or `TOOL_CALL` planning without provider-native
  tools, followed by separately metered answer synthesis;
- policy-owned top-level response projection before transient provider
  exposure;
- the first Profile-owned business tool, `profile.enterprise.search`, which
  resolves current operation `profile_searchenterprises` through BackOffice and
  leaves final authorization, validation, query, and projection authority in
  Profile;
- fail-closed tool authorization, mutation confirmation, quota,
  and provider-native-tool configuration rules;
- immutable, secret-safe effective configuration snapshots.
- generated-service persistence for conversation/message/turn/event records;
- idempotent turn acceptance and principal-owned conversation access;
- approved prompt lookup, history budgeting, redaction, citations, and usage
  events;
- trusted Assistant-to-Knowledge context adaptation through the
  `DefaultAiKnowledgeOperationsService` authority;
- immutable provider-neutral Knowledge context containing effective scope,
  active-version evidence, citations, retrieval mode, and a bounded token
  estimate;
- provider instructions that label retrieved content as reference data rather
  than executable instructions and retain citation identifiers;
- provider-neutral read-only completion.
- OOTB `axisAssistant` and `axisAssistantReadOnly` version 1 init records,
  imported explicitly and idempotently through generated schema services;
- Profile-bearer-secured create/list/get/submit/status/replay/cancel routes;
- tenant and principal ownership checks before every record read or change;
- bounded pagination and persisted event replay.
- immediate `202` turn acceptance followed by background orchestration;
- durable single-owner execution leases, bounded heartbeats, and nCache lease
  projection for fast distributed visibility;
- service-token-protected abandoned-turn reconciliation that never blindly
  repeats a provider call with an uncertain outcome;
- optional nSystem readiness contribution and secured fixed-cardinality
  execution diagnostics without conversation or identity labels;
- inactive OOTB `aiAssistantTurnRecoveryJob` contributed through CronJob core
  data, with explicit activation, node ownership, bounded recovery, and
  service-token invocation;
- authenticated SSE replay/live fan-out with heartbeats, reconnect cursors,
  bounded buffering, disconnect cleanup, and active-provider cancellation.
- authenticated cancellation intent persisted before local delivery, observed
  by the lease owner, and recovered idempotently after owner failure;
- BackOffice-owned idempotent CMS core data for the authenticated `/assistant`
  page and logical renderer keys;
- module-owned BackOffice capability/navigation metadata;
- tenant/principal-owned confirmations with immutable argument digests,
  expiry, optimistic single-winner execution and uncertain-outcome protection;
- Profile-owned confirmed enterprise creation and optional Workflow carrier
  handoff without duplicated process state;

Target modules retain business authorization, validation, persistence, and
execution authority. Workflow retains durable process authority. AI Knowledge
retains retrieval and citation authority.

## Configuration and customization

Override only the smallest required values below `aiAssistant` through the normal
Nodics project, environment, server, node, tenant, or customer layers. Do not
copy this module. AI Assistant stores only an `aiProviders` usage-profile code.
Provider selection, adapters, models, credentials, and normalized provider
results belong to `aiProviders`.

The validation service rejects unknown top-level keys, inline credentials,
browser credentials, model self-approval, missing target authorization,
disabled mutation confirmation, non-SSE version 1 transport, and fail-open
quota enforcement.

`aiAssistant.confirmations.ttlSeconds` accepts 60–3600 seconds and
`executionTimeoutMs` accepts 100–30000 milliseconds. Later layers may tighten
these bounds but may not disable argument binding, target authorization,
idempotency, or Workflow ownership.

Confirmation rejection is explicit: unsupported mutations use
`ERR_AIA_00006` (400), stale, changed, conflicting, or replayed confirmations
use `ERR_AIA_00007` (409), and expired confirmations use `ERR_AIA_00008` (410).
Successful direct execution persists `CONSUMED` only after Profile returns.
Successful durable handoff persists the Workflow carrier code and leaves the
configured Workflow responsible for later manual and automatic actions.

Run the focused contract test:

```text
node gAi/aiAssistant/test/aiAssistantContractAndConfiguration.test.js
node gAi/aiAssistant/test/aiAssistantReadOnlyVerticalSliceContract.test.js
node gAi/aiAssistant/test/aiAssistantKnowledgeContextContract.test.js
node gAi/aiAssistant/test/aiAssistantSecuredRoutesContract.test.js
node gAi/aiAssistant/test/aiAssistantTurnExecutionLeaseContract.test.js
node gAi/aiAssistant/test/aiAssistantExecutionObservabilityContract.test.js
node gAi/aiAssistant/test/aiAssistantCronRecoveryContract.test.js
node gAi/aiAssistant/test/aiAssistantDistributedCancellationContract.test.js
node gAi/aiAssistant/test/aiAssistantGovernedReadToolContract.test.js
node gAi/aiAssistant/test/aiAssistantToolPlanningLoopContract.test.js
node gAi/aiAssistant/test/aiAssistantConfirmationAndWorkflowContract.test.js
```
