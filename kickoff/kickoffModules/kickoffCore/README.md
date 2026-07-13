# kickoffCore Module

`kickoffCore` owns core domain behavior for the `kickoff` application. It provides project-specific schema, route, service, pipeline, utility, configuration, and test space.

Use this module for application behavior that is not purely API or integration specific. Framework capabilities should be extended, not modified.

Core changes should preserve validation, tenant context, access control, diagnostics, and generated artifacts.
