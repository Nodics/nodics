# nEvent

`nEvent` runs in-platform event listeners. It lets one capability announce that
something happened without hardcoding every interested module into the
publisher. Broker transport remains owned by `nEms`; persisted distribution and
event logs remain owned by `gCore/nems`.

`nEvent` owns the framework event publishing and listener execution contract.

Nodics separates framework event publishing from persisted event distribution:
`nEvent` provides the framework event capability, while `gCore/nems` owns
persisted distribution and event-log behavior.

## Ownership

`nEvent` is responsible for:

- event publish APIs used by framework and capability modules;
- listener registration and lookup;
- event context propagation;
- extension points for later modules to add or override listeners;
- integration with distributor modules where configured.

## Extension Contract

Modules should register listeners through source definitions and services. Do
not hardcode target module behavior in framework event code. Event payloads
must preserve tenant/request context, traceability, and sanitized diagnostics.

When changing event behavior, test default listener execution and later-module
listener overrides.

## Capability

`nEvent` provides:

- event controller and facade boundaries;
- `DefaultEventService` for listener loading, registration, update, removal, publish, and handle behavior;
- module-local event listener definitions through `src/event/listeners.js`;
- optional persisted listener merge when generated listener model support is available;
- common listener registration across active modules;
- module-specific listener registration;
- `EventService` and `EventError` library primitives;
- event listener change handling.

Event listeners are source-owned contracts. Later modules can add, disable, or override listeners through active module hierarchy and persisted runtime governance where available.

## Runtime Flow

1. Startup loads listener definitions from active modules.
2. Persisted listener definitions are merged when listener model support is available.
3. Common listeners are registered against active modules.
4. Module-specific listeners are registered against their owning module.
5. `publish` or `handleEvent` receives an event with tenant and context.
6. Registered listeners execute through module event services.
7. Listener update/removal events refresh runtime listener state.

Events triggered by EMS messages must preserve tenant context, source, target, node id, header, event type, and sanitized diagnostics.

## Listener Guidance

A listener definition should document:

- event name;
- owning module;
- handler service and method;
- active flag;
- node restriction when applicable;
- tenant expectation;
- source/target expectation;
- retry or failure behavior;
- side effects and tests.

Do not put broker-specific messaging behavior here. EMS modules own broker integration; `nEvent` owns in-platform event listener execution.

## Tests

Run:

```bash
npm run quality:docs
npm run docs:coverage:source -- --limit=20
```

When changing event behavior, add focused tests for listener registration, listener override, tenant/context propagation, local handling, remote publishing, and failure diagnostics.

## What To Avoid

Avoid:

- hardcoding target module behavior in event service code;
- dropping tenant or trace context from event payloads;
- mixing broker client logic into event listeners;
- registering listeners outside `src/event/listeners.js` or governed persisted listener models;
- returning raw internal errors in event diagnostics.

## Delivery, Failure, And Performance

Document whether an event is local, remotely distributed, persisted, replayable,
or best effort. A local listener call is not durable messaging. Listener side
effects must define idempotency and failure handling when an upstream broker or
persisted distributor can redeliver.

Keep listener execution bounded and observable by event, source, target,
module, tenant, correlation, node, duration, and safe outcome. Do not use full
payloads or sensitive fields as telemetry labels. Long-running or durable work
belongs in messaging, jobs, or workflows rather than blocking a local event
chain.

## Continue

- Broker messaging: [nEms](../nEms/README.md)
- Persisted event distribution: [nems](../../gCore/nems/README.md)
- Public platform guide: [How Platform Capabilities Work](../../gDocs/platform/how-platform-capabilities-work.md)
- Framework map: [gFramework](../README.md)
