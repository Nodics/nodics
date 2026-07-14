# startioInt Module

`startioInt` owns integration behavior for the `startio` application. It provides project-specific schema, route, service, pipeline, utility, configuration, and test space for external or cross-module integration.

Use this module for integration contracts and adapters. Core project rules belong in `startioCore`, and API request handling belongs in `startioApi`.

Integration changes must preserve provider governance, diagnostics, retry/rollback expectations, access control, and layered configuration.
