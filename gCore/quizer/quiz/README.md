# quiz Module

`quiz` owns the base quiz capability. It provides the module space for quiz schemas, services, pipelines, interceptors, utilities, configuration, and tests.

Use this module for generic quiz definitions and runtime behavior. Workflow-specific quiz behavior belongs in `wquiz`, and variant/runtime activation behavior belongs in `vquiz`.

Quiz changes should preserve generated contracts, validation, tenant context, and test coverage.
