# nValidator

`nValidator` owns the framework validation capability. It provides validator schemas, generated API/CRUD contracts, validator configuration services, script execution support, update pipelines, and change listeners.

Use this module for reusable validation behavior and validator lifecycle contracts. Domain-specific validation rules should be registered through validator data/configuration or project modules rather than hardcoded into framework services.

Validation changes must preserve deterministic execution, diagnostics, tenant context, generated artifacts, and test coverage because validators are platform contracts.
