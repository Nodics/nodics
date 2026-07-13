# kickoffApi Module

`kickoffApi` owns API-facing behavior for the `kickoff` application. It provides project-specific schema, route, service, pipeline, utility, configuration, and test space for request contracts.

Use this module for application APIs. Core project behavior belongs in `kickoffCore`, and integration behavior belongs in `kickoffInt`.

API changes must preserve route governance, access control, tenant context, diagnostics, and generated contract alignment.
