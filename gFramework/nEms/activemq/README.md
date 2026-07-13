# activemq Module

`activemq` is the ActiveMQ provider adapter for the `nEms` messaging family. It owns ActiveMQ-specific connection defaults, producer/consumer wiring, and provider pipeline hooks.

Use this module for ActiveMQ behavior only. Shared EMS client APIs, active publisher selection, tenant resolution, and message route contracts belong in `nEms/emsClient`.

Broker URLs, credentials, topics, queues, and environment topology must come from layered configuration. Framework defaults should remain provider-safe and replaceable.
