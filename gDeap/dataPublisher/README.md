# dataPublisher Module

`dataPublisher` owns outbound data publishing behavior in the DEAP layer. It provides configuration, schemas, routes, services, pipelines, interceptors, utilities, events, and tests for dispatching processed data.

Use this module for publishing contracts and outbound delivery behavior. Inbound consumption belongs in `dataConsumer`, and transformation belongs in `dataProcessor`.

Publishing changes must preserve access control, auditability, tenant context, retry/rollback expectations, and provider configuration boundaries.

## Current Capability Status

This module currently provides the standard capability structure and extension
slots, not a production destination provider. Projects must implement and
qualify the selected API, broker, file, object-storage, search, database, or
other destination through its owning provider contract.

## Publishing Contract

Each publisher must define the authoritative destination alias, output
schema/version, access policy, tenant routing, idempotency key, ordering,
batching, timeout, safe retry, acknowledgement, partial failure, dead-letter or
quarantine behavior, retention/cleanup, reconciliation, and compensation.

Do not accept an arbitrary URL, queue, topic, bucket, path, credentials, or
handler from a request. Resolve approved destinations from layered
configuration and call the existing export, messaging, search, database, or
integration provider contract instead of embedding another client.

## Verification

Add tests for access-policy filtering, valid publish, cross-tenant denial,
duplicate/idempotent retry, invalid destination, partial batch, timeout,
provider outage/recovery, acknowledgement, reconciliation, sanitized
diagnostics, and guarded live integration.

## Continue

- DEAP lifecycle: [gDeap](../README.md)
- Processing stage: [dataProcessor](../dataProcessor/README.md)
- Export lifecycle: [nExport](../../gFramework/nData/nExport/README.md)
- Messaging providers: [nEms](../../gFramework/nEms/README.md)
