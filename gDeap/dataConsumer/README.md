# dataConsumer Module

`dataConsumer` owns inbound data consumption behavior in the DEAP layer. It provides configuration, data, schemas, routes, services, pipelines, interceptors, events, utilities, and tests for consuming data into Nodics.

Use this module for source consumption and ingestion-facing behavior. Data transformation belongs in `dataProcessor`, and outbound publishing belongs in `dataPublisher`.

Consumption changes must preserve validation, tenant isolation, diagnostics, replay/rollback expectations, and auditability.

## Current Capability Evidence

The module owns external/internal data schemas, generated schema/API/scenario
contracts, event handlers for external and internal data, and an internal data
consume process service. This proves a reusable consumption boundary; it does
not qualify every external source, transport, payload, or production topology.

## Consumption Contract

A concrete source must define a governed source alias, schema/version,
authentication, tenant/module allowlist, maximum bytes/records, checksum or
message identity, ordering, duplicate/idempotency policy, timeout/retry,
quarantine, acknowledgement, cleanup, and recovery. Provider connection and
credentials stay in the owning transport/provider module and secret-backed
configuration.

Preserve source, tenant, correlation, batch/message identity, lineage, received
time, validation outcome, and safe failure reason into processing. Do not use
raw sensitive payloads as log or metric labels.

## Verification

Run generated contracts and add focused flow tests for valid input, malformed
input, unauthorized source, cross-tenant denial, duplicate/replay, size and
batch boundaries, unavailable provider, retry exhaustion, quarantine, and
recovery.

## Continue

- DEAP lifecycle: [gDeap](../README.md)
- Processing stage: [dataProcessor](../dataProcessor/README.md)
- Import lifecycle: [nImport](../../gFramework/nData/nImport/README.md)
- Messaging: [nEms](../../gFramework/nEms/README.md)
