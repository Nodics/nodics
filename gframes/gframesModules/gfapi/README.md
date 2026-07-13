# gfapi Module

`gfapi` owns API-facing behavior for the `gframes` application. It provides project-specific routes, schemas, pipelines, interceptors, utilities, configuration, and tests.

Use this module for request contracts and application APIs. Core project data and behavior should remain in `gfcore`, with profile and content behavior in their dedicated modules.

API changes must preserve route governance, access control, tenant context, diagnostics, and generated contract alignment.
