# gfcore Module

`gfcore` owns core project behavior for the `gframes` application. It provides project-specific data, schemas, routes, pipelines, interceptors, utilities, configuration, and tests.

Use this module for application domain behavior that is not purely API, profile, or content specific. Framework capabilities should be extended, not modified.

Core project changes should preserve validation, tenant context, access control, diagnostics, and generated artifacts.
