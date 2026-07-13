# wcms Module

`wcms` owns workflow-enabled CMS behavior. It depends on `cms` and adds the module space for content workflows, workflow-aware schemas, services, pipelines, interceptors, and tests.

Use this module when content behavior needs workflow governance. Plain content structures and CMS lifecycle behavior belong in `gContent/cms`.

Workflow content changes must preserve source definitions, validation, auditability, tenant isolation, and rollback expectations.
