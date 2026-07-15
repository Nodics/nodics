# activemq Module

`activemq` is the ActiveMQ provider adapter for the `nEms` messaging family. It owns ActiveMQ-specific connection defaults, producer/consumer wiring, and provider pipeline hooks.

Use this module for ActiveMQ behavior only. Shared EMS client APIs, active publisher selection, tenant resolution, and message route contracts belong in `nEms/emsClient`.

Broker URLs, credentials, topics, queues, and environment topology must come from layered configuration. Framework defaults should remain provider-safe and replaceable.

## Capability

The module contributes:

- ActiveMQ/STOMP connection handling through `stompit`;
- failover connection manager setup;
- producer creation through the active STOMP connection;
- publisher configuration through the provider contract;
- JSON and plain-message publishing to `/queue/{queueName}`;
- consumer subscription through STOMP channels;
- consumed-message dispatch into `processConsumedMessagePipeline`;
- failed consumed-message logging through `emsFailedMessages` when enabled.

## Runtime Flow

1. `emsClient` selects an ActiveMQ client configuration with `DefaultActivemqClientService` as handler.
2. ActiveMQ connection and reconnect options are resolved from layered configuration.
3. The adapter creates a failover connection manager and active connection.
4. Publishers send messages to configured queues.
5. Consumers subscribe to configured queues and read messages as UTF-8.
6. Consumed messages are passed into the shared EMS processing pipeline.
7. Failed consumed messages can be stored through the EMS failed-message model when tenant context is available.

## Configuration

ActiveMQ configuration should include:

- connection options;
- reconnect/failover options;
- producer options;
- consumer options;
- queue names;
- tenant/header/fallback policy from `emsClient`;
- credentials and TLS settings through governed configuration when needed.

Do not hardcode broker hosts, credentials, queue names, retry policy, or tenant routing in source files.

## Tests

Run the current module baseline with:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

Production ActiveMQ enablement should also include guarded live-provider tests against an ephemeral or managed broker.

## What To Avoid

Avoid:

- calling ActiveMQ directly from business modules;
- accepting arbitrary queue names from untrusted payloads;
- bypassing `emsClient` publisher/consumer configuration;
- logging failed consumed messages without tenant context;
- exposing broker connection details in errors;
- enabling production ActiveMQ without live-provider validation and sanitized diagnostics.
