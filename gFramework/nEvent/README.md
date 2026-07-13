# nEvent

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
