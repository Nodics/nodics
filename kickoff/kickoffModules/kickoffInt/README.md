# kickoffInt Module

`kickoffInt` owns integration behavior for the `kickoff` application. It provides project-specific schema, route, service, pipeline, utility, configuration, and test space for external or cross-module integration.

Use this module for integration contracts and adapters. Core project rules belong in `kickoffCore`, and API request handling belongs in `kickoffApi`.

Integration changes must preserve provider governance, diagnostics, retry/rollback expectations, access control, and layered configuration.
