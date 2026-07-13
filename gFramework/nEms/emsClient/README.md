# emsClient Module

`emsClient` is the shared messaging client capability for `nEms`. It owns the framework-facing APIs and route contracts for publishing messages through the active EMS provider.

Use this module for provider-neutral message publishing, tenant resolution, active provider selection, and EMS client facade/controller behavior. Provider-specific broker wiring belongs in modules such as `activemq` and `kafka`.

Project extensions should register providers and message policies through layered configuration. Do not bypass tenant context, access control, diagnostics, or provider selection when adding messaging behavior.

## Provider Adapter Checklist

When adding a messaging provider:

- keep controller, facade, route, and shared client behavior provider-neutral;
- add provider-specific broker behavior in an adapter module or later project
  module;
- configure active provider, connection handler, producers, consumers, topics,
  queues, retries, and tenant mappings through layered `emsClient` properties;
- preserve tenant context, provider selection, diagnostics, validation, error
  envelopes, and retry/failure handling;
- test provider activation, disabled behavior, publish/consume behavior,
  failure behavior, and later-module overrides.
