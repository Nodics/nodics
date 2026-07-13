# dataPublisher Module

`dataPublisher` owns outbound data publishing behavior in the DEAP layer. It provides configuration, schemas, routes, services, pipelines, interceptors, utilities, events, and tests for dispatching processed data.

Use this module for publishing contracts and outbound delivery behavior. Inbound consumption belongs in `dataConsumer`, and transformation belongs in `dataProcessor`.

Publishing changes must preserve access control, auditability, tenant context, retry/rollback expectations, and provider configuration boundaries.
