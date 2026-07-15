# nEms

`nEms` owns enterprise messaging integration contracts and adapter modules.

Messaging guidance covers producer and consumer flows plus configuration
examples for providers such as Tibco, ActiveMQ, and Kafka. Implementations must
keep provider-specific behavior behind adapter modules and layered
configuration.

## Module Family

The EMS family is split by responsibility:

- `emsClient` owns provider-neutral publish, consumer registration, publisher registration, close operations, message processing, failed-message persistence, tenant resolution, route contracts, and message-to-event dispatch.
- `kafka` owns Kafka-specific client, producer, topic, consumer, publish, and failed-consume handling behavior.
- `activemq` owns ActiveMQ/STOMP-specific connection, producer, queue, consumer, publish, and failed-consume handling behavior.

Business modules should publish and consume through the EMS capability contract. Provider clients must stay inside provider modules or later active project modules.

## Ownership

`nEms` coordinates:

- messaging client contracts;
- provider adapter modules;
- producer and consumer configuration;
- message routing and runtime diagnostics;
- extension guidance for adding providers.
- failed-message capture through `emsFailedMessages`;
- consumed-message translation and event dispatch into `nEvent`.

## Producer And Consumer Flow

Messaging is a producer/consumer system. That flow must stay provider-neutral until the selected adapter sends or receives the message.

A producer defines:

- owning module and operation;
- event or message name;
- payload shape;
- tenant/request context;
- target provider/channel/topic/queue from configuration;
- retry and failure behavior;
- diagnostics.

A consumer defines:

- provider subscription configuration;
- handler service;
- idempotency and duplicate behavior;
- tenant context resolution;
- error handling and retry/dead-letter policy;
- tests for normal, invalid, and failure messages.

Do not let provider-specific message clients leak into business services.
Business services publish or consume through the EMS capability
contract.

## Runtime Flow

1. Layered `emsClient` configuration defines clients, publishers, consumers, handlers, queue/topic options, node ownership, and tenant policy.
2. `DefaultEmsClientConfigurationService` configures enabled clients, creates provider producers, and registers enabled publishers/consumers only for the active node.
3. `DefaultEmsClientService.publish` accepts a single payload or a payload array, resolves the configured publisher by queue name, and delegates to the provider handler.
4. Provider adapters publish to the broker and return normalized success/error envelopes.
5. Consumers pass received messages into `processConsumedMessagePipeline`.
6. `DefaultMessageProcessService` validates queue/message shape, applies the configured message handler pipeline, resolves tenant, and publishes or handles an internal Nodics event.
7. Failed consumed messages can be logged into `emsFailedMessages` when enabled and tenant context is available.

## Extension Contract

Projects add or replace messaging providers through later modules,
adapter services, and layered configuration. Do not hardcode provider URLs,
credentials, queue names, topics, tenant mappings, or retry policy in framework
code.

Provider integrations must preserve validation, sanitized observability, retry
or failure handling, and tests for configured provider behavior where practical.

## Adding A Messaging Provider

New messaging providers must be added as provider modules or project modules
behind the `nEms/emsClient` provider-neutral contract. For example, RabbitMQ,
AWS SNS/SQS, Google Pub/Sub, or a customer broker follows the adapter
shape used by `activemq` and `kafka`.

The implementation path is:

1. Create an owned messaging provider module.
2. Contribute layered `emsClient` configuration for provider activation,
   connection handler, producers, consumers, topics, queues, retries,
   credentials, and tenant mappings.
3. Implement provider-specific publish/consume behavior behind the shared EMS
   client contract.
4. Preserve tenant resolution, active provider selection, validation, sanitized
   diagnostics, retry/failure handling, and route contracts.
5. Add tests for provider activation, disabled provider behavior, publish and
   consume contracts, failure handling, tenant mapping, and later-module
   overrides.

Broker URLs, credentials, topic names, queue names, subscriptions, and routing
topology must come from layered configuration or governed runtime layers.

## Tests

Run focused EMS coverage with:

```bash
node gFramework/nEms/emsClient/test/emsClientServiceContract.test.js
node gFramework/nEms/emsClient/test/emsMessageProcessContract.test.js
node gFramework/nEms/emsClient/test/messageTenantResolution.test.js
node gFramework/nEms/emsClient/test/activeEmsPublisher.test.js
node gFramework/nEms/kafka/test/kafkaPublishCapabilityBehavior.test.js
npm run quality:docs
```

## What To Avoid

Avoid:

- calling Kafka, ActiveMQ, or another broker directly from business services;
- hardcoding broker URLs, credentials, topics, queues, or tenant mappings in source code;
- registering consumers without tenant resolution and failure handling;
- publishing consumed messages into events without validation and handler translation;
- exposing raw broker errors or credentials in diagnostics;
- treating provider smoke tests as release coverage for a production broker.
