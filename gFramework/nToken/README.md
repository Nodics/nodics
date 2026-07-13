# nToken

`nToken` owns framework token capability support. It provides token schemas, token generation and validation pipelines, token handler services, validity checks, and related route contracts.

Use this module when changing token lifecycle behavior that is independent of a specific application. Authentication policy and login semantics remain owned by auth modules, while this module handles token capability mechanics.

Token behavior must preserve validation, auditability, tenant context, expiry rules, and generated schema contracts. Project-specific token policies should be configured through layered properties and active modules.
