# wquiz Module

`wquiz` owns workflow-enabled quiz behavior. It extends the quiz capability with workflow-specific configuration, schemas, services, pipelines, and tests.

Use this module when quiz behavior must participate in workflow governance. Keep base quiz definitions in `quiz` and runtime variant wiring in `vquiz`.

Workflow quiz changes must remain source-of-truth driven, auditable, and safe for tenant-specific extension.
