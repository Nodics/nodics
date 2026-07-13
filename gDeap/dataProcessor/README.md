# dataProcessor Module

`dataProcessor` owns data transformation and processing behavior in the DEAP layer. It provides the module space for processing schemas, services, pipelines, interceptors, utilities, events, and tests.

Use this module for processing rules between consumption and publishing. Inbound source handling belongs in `dataConsumer`, and outbound dispatch belongs in `dataPublisher`.

Processing behavior should be deterministic, traceable, tenant-aware, and configurable through layered definitions.
