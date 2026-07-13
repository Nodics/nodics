# flowApi Module

`flowApi` owns the API-facing workflow capability. It provides workflow route, controller, facade, pipeline, interceptor, utility, and test space for exposing workflow behavior.

Use this module for API contracts and request handling. Workflow data definitions belong in `flowSchema`, and core workflow execution behavior belongs in `flowCore`.

API changes must preserve route governance, access control, tenant context, diagnostics, and generated contract alignment.
