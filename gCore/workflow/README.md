# workflow

`workflow` coordinates business work that spans multiple steps, decisions,
people, modules, or asynchronous events. A durable carrier groups one or more
items as actions and channels move them through a governed process.

## Capability Map

| Owner | Responsibility |
| --- | --- |
| [flowSchema](flowSchema/README.md) | Authoritative workflow definitions and durable carrier/item contracts |
| [flowCore](flowCore/README.md) | Application execution, actions, decisions, splits, retries, and event continuation |
| [flowApi](flowApi/README.md) | Secured carrier and action command APIs |
| [nbpm](../../gFramework/nbpm/README.md) | Generic framework workflow-to-schema lifecycle integration |

**Maturity: Production-ready capability.** Auto, manual, mixed, multi-step,
split/retry, event-continuation, lifecycle, route, and generated contracts are
covered. Project flows must still qualify their domain rules and integrations.

The module composes `flowSchema`, `flowCore`, and `flowApi` and provides their
group-level configuration and activation point. It participates in the shared
runtime lifecycle: drain rejects new carrier work and waits within the global
shutdown deadline, while durable carrier state remains recovery authority after
hard process termination.

Workflow owns optional BackOffice catalogue metadata in `package.json`. That
metadata enables client-safe discovery only. BackOffice never replaces flow API
authorization, definitions, schemas, or durable state.

Do not duplicate definitions or state in `nbpm`, BackOffice, tooling, or a
client. `nbpm` provides reusable schema-lifecycle hooks; this application
workflow family remains authoritative for its definitions, carriers, actions,
channels, and command behavior.

## Lifecycle And Recovery Contract

1. A governed definition selects the head action and allowed graph.
2. A command or event initializes a tenant-scoped carrier and items.
3. Release starts automatic work or exposes a permitted manual action.
4. An action response selects an allowed channel and persists the transition.
5. Splits create traceable branches; aggregation waits under explicit policy.
6. Terminal work is finished, archived, or moved to an error/recovery state.

Durable carrier/item state is recovery authority. Process-local pipelines and
event delivery are transient. Every flow must define idempotency, concurrency,
timeout, retry/replay, late-event, cancellation, compensation, retention, and
definition-version behavior. Rollback can restore Nodics records only where the
owning data contract supports it; external side effects require business
compensation and reconciliation.

## Initial Users And Credentials

Initializer data may define inactive example principals for workflow authoring
and approval groups. It must not provide usable framework passwords or API
keys. Real users, service accounts, and credentials belong in the project or
environment identity layer and governed secret handling.

## Security, Deployment, And Observability

Tenant and principal context must survive every command, internal module call,
event, split branch, and continuation. Target modules independently authorize
their own operations. Keep human login separate from module, event, and cron
credentials, and never accept arbitrary executable handlers from request data.

Workflow may run in consolidated or modular topology without changing
authority. Restart continues from durable state. Set project limits for active
carriers, items per carrier, split fan-out, action duration, retries, payload
size, and retention.

Observe carrier/item age and state, action/channel outcomes, manual wait time,
automatic latency, split/aggregation, retries, duplicate denial, error/archive
movement, dependency latency, and stuck work using safe tenant/correlation
dimensions. Never log credentials or unredacted item/callback payloads.

## Verification

Run `npm run test:suite -- --suite=workflow`. Add flow-specific positive,
negative, boundary, permission, tenant, transition, decision, event, split,
retry, replay, concurrency, restart, compensation, performance, integration,
and regression tests. Generated CRUD/API coverage proves contracts, not the
correctness of a project's business flow.

## Continue

- Core capability family: [gCore](../README.md)
- Framework lifecycle integration: [nbpm](../../gFramework/nbpm/README.md)
- Events and messaging: [nEvent](../../gFramework/nEvent/README.md)
- Capability maturity: [Provider And Capability Maturity Matrix](../../gDocs/reference/provider-capability-maturity-matrix.md)
