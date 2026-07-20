# flowCore

`flowCore` is the application workflow execution owner. It loads workflow
definitions, initializes carriers and items, performs automatic or manual
actions, evaluates channels, handles splits, and continues work through events.

**Maturity: Production-ready capability.** The reusable engine is covered by
deterministic contracts; every project workflow still needs its own graph,
authorization, idempotency, compensation, performance, and integration tests.

## Ownership

`flowSchema` owns persisted data contracts and `flowApi` owns secured HTTP
commands. `flowCore` owns runtime services, pipelines, listeners, handlers, and
state-transition behavior. `nbpm` supplies generic framework workflow-to-schema
lifecycle integration; it is not a parallel application workflow engine.

## Execution Contract

A flow must define its head action, allowed action types and decisions,
channels and terminal paths, tenant context, handler ownership, event contract,
timeout, retry and replay safety, split/aggregation rules, and failure outcome.
Automatic handlers must be deterministic or explicitly idempotent. Manual
actions must verify the acting principal and current carrier/item state.

Events can resume durable work after asynchronous processing, but delivery is
not proof of exactly-once execution. Preserve carrier, item, tenant,
correlation, causation, event, attempt, and definition-version identity.
Duplicate, late, out-of-order, and replayed events must be rejected or handled
idempotently.

## Failure And Recovery

- Persist state before relying on process-local continuation.
- Distinguish retryable dependency failure from invalid state or business
  rejection; never retry every error blindly.
- Make split branches independently traceable and define aggregation behavior
  for success, partial success, timeout, and terminal failure.
- Define cancellation and compensation as explicit business actions. Database
  rollback cannot undo remote calls, messages, payments, or external effects.
- Rebuild or continue from durable carrier state after restart; do not treat
  in-memory pipeline state as recovery authority.

## Operations And Tests

Monitor carrier/action/channel transition counts, age in state, execution and
dependency latency, retry, replay/duplicate denial, split fan-out, aggregation,
error carrier creation, archival, and stuck work. Avoid sensitive item or
callback payloads in logs and metric labels.

Run `npm run test:suite -- --suite=workflow`. Add flow-specific positive,
invalid transition, unauthorized, cross-tenant, manual/automatic, decision,
split, partial failure, timeout, duplicate event, retry, replay, restart,
compensation, concurrency, performance, integration, and regression tests.

## Continue

- Workflow family: [workflow](../README.md)
- Data contracts: [flowSchema](../flowSchema/README.md)
- HTTP commands: [flowApi](../flowApi/README.md)
- Framework lifecycle integration: [nbpm](../../../gFramework/nbpm/README.md)
