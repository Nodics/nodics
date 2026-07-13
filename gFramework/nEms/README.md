# nEms

`nEms` owns enterprise messaging integration contracts and adapter modules.

Messaging guidance covers producer and consumer flows plus configuration
examples for providers such as Tibco, ActiveMQ, and Kafka. Implementations must
keep provider-specific behavior behind adapter modules and layered
configuration.

## Ownership

`nEms` coordinates:

- messaging client contracts;
- provider adapter modules;
- producer and consumer configuration;
- message routing and runtime diagnostics;
- extension guidance for adding providers.

## Extension Contract

Projects should add or replace messaging providers through later modules,
adapter services, and layered configuration. Do not hardcode provider URLs,
credentials, queue names, topics, tenant mappings, or retry policy in framework
code.

Provider integrations must preserve validation, sanitized observability, retry
or failure handling, and tests for configured provider behavior where practical.

## Adding A Messaging Provider

New messaging providers must be added as provider modules or project modules
behind the `nEms/emsClient` provider-neutral contract. For example, RabbitMQ,
AWS SNS/SQS, Google Pub/Sub, or a customer broker should follow the adapter
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
