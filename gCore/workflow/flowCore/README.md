# flowCore Module

`flowCore` owns core workflow runtime behavior for the application workflow layer. It provides the module space for workflow services, pipelines, interceptors, utilities, configuration, and tests.

Use this module for execution behavior and workflow lifecycle rules. Schema definitions belong in `flowSchema`, and API-facing routes belong in `flowApi`.

Workflow runtime changes must remain auditable, tenant-aware, rollback-safe, and covered by tests.
