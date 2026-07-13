# cms Module

`cms` owns content-management capability behavior. It provides the module space for CMS data, schemas, routes, services, pipelines, interceptors, utilities, and tests.

Use this module for reusable content structures and content lifecycle behavior. Workflow-specific content behavior belongs in `gContent/wcms`.

Content definitions should remain schema-driven and tenant-aware so projects can extend CMS behavior without changing shared module code.
