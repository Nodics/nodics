# kafka Module

`kafka` is the Kafka provider adapter for the `nEms` messaging family. It owns Kafka-specific connection defaults, producer/consumer wiring, and provider pipeline hooks.

Use this module for Kafka behavior only. Shared EMS client APIs, active publisher selection, tenant resolution, and message route contracts belong in `nEms/emsClient`.

Cluster endpoints, credentials, topics, and deployment details must be supplied through layered configuration. Keep framework code generic enough for project-level provider replacement.
