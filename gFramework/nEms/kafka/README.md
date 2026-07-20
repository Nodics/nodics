# kafka Module

**Maturity: Guarded provider.** Deterministic publish behavior is covered, but
production use requires live broker, consumer, failure, and recovery evidence.

`kafka` is the Kafka provider adapter for the `nEms` messaging family. It owns Kafka-specific connection defaults, producer/consumer wiring, and provider pipeline hooks.

Use this module for Kafka behavior only. Shared EMS client APIs, active publisher selection, tenant resolution, and message route contracts belong in `nEms/emsClient`.

Cluster endpoints, credentials, topics, and deployment details must be supplied through layered configuration. Keep framework code generic enough for project-level provider replacement.

## Capability

The module contributes:

- Kafka client creation through `kafkajs`;
- broker list normalization from `brokers` or `kafkaHost`;
- retry option mapping;
- admin connection and topic discovery;
- producer creation;
- publisher configuration through the provider contract;
- message normalization for object, keyed object, and plain string payloads;
- publish behavior that sends to the configured topic;
- consumer registration with topic creation when required;
- consumed-message dispatch into `processConsumedMessagePipeline`;
- failed consumed-message logging through `emsFailedMessages` when enabled.

## Runtime Flow

1. `emsClient` selects a Kafka client configuration with `DefaultKafkaClientService` as handler.
2. Kafka connection options are resolved from layered configuration.
3. The adapter creates a Kafka admin client, lists topics, and creates a producer.
4. Publishers map configured queue names to Kafka topics.
5. Publish requests are converted into Kafka message arrays and sent to the topic.
6. Consumers subscribe by topic and group id, then pass message values into the EMS processing pipeline.
7. Failed consumed messages can be stored through the EMS failed-message model when tenant context is available.

## Configuration

Kafka configuration should include:

- broker list or `kafkaHost`;
- client id;
- connection and request timeouts;
- retry policy;
- producer options;
- consumer group id;
- topic creation policy;
- tenant/header/fallback policy from `emsClient`;
- credentials and TLS/SASL settings through governed configuration when needed.

Do not hardcode cluster endpoints, credentials, topic names, group ids, or tenant routing in source files.

## Tests

Run focused Kafka behavior coverage with:

```bash
node gFramework/nEms/kafka/test/kafkaPublishCapabilityBehavior.test.js
npm run quality:docs
```

Production Kafka enablement should also include guarded live-provider tests against an ephemeral or managed Kafka cluster.

## What To Avoid

Avoid:

- calling Kafka directly from business modules;
- accepting arbitrary topic names from untrusted payloads;
- bypassing `emsClient` publisher lookup;
- serializing messages without preserving the configured EMS payload contract;
- logging failed consumed messages without tenant context;
- enabling production Kafka without live-provider validation and sanitized diagnostics.

## Operations And Qualification

Define topic ownership, partitions, keys and ordering, replication, retention,
consumer groups, offset/acknowledgement policy, retry/backoff, dead-letter or
failed-message policy, schema compatibility, TLS/SASL, capacity, and recovery.
Monitor broker connectivity, publish latency, consumer lag, rebalance, retries,
duplicates, deserialization failure, and poison messages.

Guarded live tests should cover topic creation policy, publish/consume,
partition ordering assumptions, consumer restart/rebalance, duplicate delivery,
handler failure, offset behavior, unavailable broker, reconnect, and cleanup in
an isolated cluster.

## Continue

- Provider-neutral contract: [emsClient](../emsClient/README.md)
- Messaging family: [nEms](../README.md)
- Maturity matrix: [Provider And Capability Maturity Matrix](../../../gDocs/reference/provider-capability-maturity-matrix.md)
- Event execution: [nEvent](../../nEvent/README.md)
