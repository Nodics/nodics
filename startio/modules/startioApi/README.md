# startioApi Module

`startioApi` owns API-facing behavior for the `startio` application. It provides project-specific schema, route, service, pipeline, utility, configuration, and test space for request contracts.

Use this module for application APIs. Core project behavior belongs in `startioCore`, and integration behavior belongs in `startioInt`.

API changes must preserve route governance, access control, tenant context, diagnostics, and generated contract alignment.
