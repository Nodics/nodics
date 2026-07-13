# dataConsumer Module

`dataConsumer` owns inbound data consumption behavior in the DEAP layer. It provides configuration, data, schemas, routes, services, pipelines, interceptors, events, utilities, and tests for consuming data into Nodics.

Use this module for source consumption and ingestion-facing behavior. Data transformation belongs in `dataProcessor`, and outbound publishing belongs in `dataPublisher`.

Consumption changes must preserve validation, tenant isolation, diagnostics, replay/rollback expectations, and auditability.
