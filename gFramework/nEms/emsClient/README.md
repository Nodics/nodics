# emsClient Module

The `emsClient` module is the provider-neutral messaging authority. Business
modules publish to configured logical destinations; provider modules translate
that contract into Kafka, ActiveMQ, or another qualified broker.

`emsClient` is the shared messaging client capability for `nEms`. It owns the framework-facing APIs and route contracts for publishing messages through the active EMS provider.

Messaging participates in central readiness and shutdown. Drain closes
consumers before publishers and provider connections so no new messages are
acquired during termination.

Use this module for provider-neutral message publishing, tenant resolution, active provider selection, and EMS client facade/controller behavior. Provider-specific broker wiring belongs in modules such as `activemq` and `kafka`.

Project extensions should register providers and message policies through layered configuration. Do not bypass tenant context, access control, diagnostics, or provider selection when adding messaging behavior.

## Capability

The module contributes:

- provider-neutral EMS controller and facade behavior;
- `DefaultEmsClientService` for publish, register consumers, close consumers, register publishers, and close publishers;
- `DefaultEmsClientConfigurationService` for configured client, publisher, and consumer lifecycle management;
- JSON and XML message handler services;
- node up/down handler extension points;
- consumed-message processing through `DefaultMessageProcessService`;
- generated `emsFailedMessages` schema, service, router, search, and tests;
- route and service contract tests for provider-neutral EMS behavior.

`emsClient` does not own broker client calls. Provider modules provide handlers that implement the configured client/publisher/consumer contract.

## Runtime Flow

1. Startup reads layered `emsClient` configuration.
2. Enabled clients are configured through their provider handler services.
3. Enabled publishers are configured for the node that owns them.
4. Enabled consumers are registered for the node that owns them.
5. Publish requests resolve a publisher by `payload.queue`.
6. A provider handler sends the message to the selected broker queue or topic.
7. Consumed messages are translated through the configured handler pipeline.
8. Tenant context is resolved from message data, queue header, or governed default fallback where allowed.
9. The consumed message becomes a Nodics event handled locally or published for a remote target.

The service fails closed for missing payloads, invalid publisher names, empty consumer lists, empty publisher lists, and missing tenant context.

## Failed Messages

`emsFailedMessages` stores failed consumed messages when failed-message logging is enabled and a tenant can be resolved. This gives operators a traceable recovery surface without hiding broker failures inside logs only.

Failed-message records should not contain credentials, broker connection details, or unsanitized internal errors.

## Configuration

`emsClient` configuration should define:

- clients and their provider handler services;
- publisher and consumer definitions;
- node ownership through `runOnNode` or equivalent runtime policy;
- queue/topic names;
- message handler pipeline names;
- tenant restrictions and header policy;
- retry, reconnect, and failure handling;
- failed-message logging policy.

Connection details, credentials, queue names, topic names, and tenant mappings belong in layered configuration or governed secrets.

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

## Tests

Run:

```bash
node gFramework/nEms/emsClient/test/emsClientServiceContract.test.js
node gFramework/nEms/emsClient/test/emsMessageProcessContract.test.js
node gFramework/nEms/emsClient/test/emsClientRouteContract.test.js
node gFramework/nEms/emsClient/test/messageTenantResolution.test.js
node gFramework/nEms/emsClient/test/activeEmsPublisher.test.js
npm run quality:docs
```

## What To Avoid

Avoid:

- bypassing `DefaultEmsClientConfigurationService` for active publisher or consumer lookup;
- accepting arbitrary broker destinations or handler names from API payloads;
- processing consumed messages without tenant validation;
- writing provider-specific broker code in provider-neutral services;
- logging failed messages without tenant context;
- returning raw broker credentials or connection details in errors.

## Reliability And Security Boundaries

Publishers must use configured destination names and handlers rather than
untrusted provider/topic input. Consumers must validate message structure,
resolve tenant context, preserve message/correlation identity, and define when
acknowledgement occurs relative to business handling.

Retries require an idempotent consumer or a deduplication contract. Failed
message persistence is operational evidence, not an automatic replay policy;
replay needs authorization, audit, ordering, tenant, and side-effect controls.

## Continue

- Messaging family: [nEms](../README.md)
- Kafka provider: [kafka](../kafka/README.md)
- ActiveMQ boundary: [activemq](../activemq/README.md)
- Event execution: [nEvent](../../nEvent/README.md)
