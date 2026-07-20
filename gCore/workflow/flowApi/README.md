# flowApi

`flowApi` owns the secured HTTP command boundary for application workflow. Its
routes initialize, release, and update carriers and perform workflow actions by
delegating through controllers, facades, and runtime pipelines.

**Maturity: Production-ready capability.** Production exposure depends on the
effective route permissions, tenant policy, request limits, audit controls, and
project workflow tests.

## API Boundary

Workflow commands are not generic record updates. Each request must resolve the
tenant and authenticated principal, validate the workflow/carrier/action and
current state, apply the target workflow's authorization policy, and preserve a
correlation and idempotency identity. Human commands use human bearer
authorization; events, modules, and scheduled processes use separate governed
internal credentials.

The API must not accept arbitrary handler/service names, scripts, destinations,
credentials, or cross-tenant references. Resolve executable behavior from
active-module definitions. BackOffice and other clients consume these APIs;
they never own workflow state or permissions.

## Reliability And Operations

Return stable command outcomes without implying that asynchronous downstream
work has completed. Define behavior for duplicate commands, concurrent action
attempts, stale carrier versions, partial item results, timeout, and accepted
asynchronous continuation. Apply bounded body/item limits and rate controls.

Audit safe command identity, tenant, principal, carrier, action, decision,
result, correlation, latency, and rejection reason. Never log credentials or
unredacted item/callback payloads.

## Verification

Run `npm run test:suite -- --suite=workflow`. Add API tests for authentication,
permission denial, cross-tenant denial, invalid carrier/action/state/decision,
duplicate idempotency key, concurrent conflict, request boundaries, sanitized
errors, downstream failure, contract compatibility, and full runtime
integration.

## Continue

- Workflow family: [workflow](../README.md)
- Runtime engine: [flowCore](../flowCore/README.md)
- Data contracts: [flowSchema](../flowSchema/README.md)
- Router governance: [nRouter](../../../gFramework/nRouter/README.md)
