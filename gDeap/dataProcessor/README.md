# dataProcessor Module

`dataProcessor` owns data transformation and processing behavior in the DEAP layer. It provides the module space for processing schemas, services, pipelines, interceptors, utilities, events, and tests.

Use this module for processing rules between consumption and publishing. Inbound source handling belongs in `dataConsumer`, and outbound dispatch belongs in `dataPublisher`.

Processing behavior should be deterministic, traceable, tenant-aware, and configurable through layered definitions.

## Current Capability Status

This module currently provides the standard capability structure and extension
slots, not a production transformation engine or a catalog of qualified
business processors. Project flows must supply transformations, configuration,
lineage, error behavior, and focused tests before claiming operational use.

## Processing Contract

Each processor must define input/output schema versions, deterministic mapping,
tenant and classification handling, enrichment dependencies, ordering,
idempotency, side effects, batch/memory/time limits, invalid-record behavior,
retry safety, lineage, and replay compatibility. Use `dataCore` processors,
validators, interceptors, and pipelines where those existing contracts fit;
do not create a parallel processing runtime.

Monitor records accepted/rejected/transformed, batch duration, dependency
latency, retry, quarantine, lineage gaps, and reconciliation. Never log full
sensitive records or silently discard failed transformations.

## Verification

Add focused positive, invalid-input, boundary, deterministic-repeat,
cross-tenant, dependency-failure, partial-batch, retry, replay, performance, and
downstream-contract tests for every real processor.

## Continue

- DEAP lifecycle: [gDeap](../README.md)
- Consumption stage: [dataConsumer](../dataConsumer/README.md)
- Publishing stage: [dataPublisher](../dataPublisher/README.md)
- Shared processing: [dataCore](../../gFramework/nData/dataCore/README.md)
