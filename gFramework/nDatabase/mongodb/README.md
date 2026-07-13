# mongodb Module

`mongodb` is the MongoDB adapter module for `nDatabase`. It owns Mongo-specific connection defaults, schema/model adapter behavior, and provider-specific router or pipeline wiring.

Use this module for MongoDB behavior that implements the framework database contracts. Shared DAO abstractions, schema access policy, generated CRUD behavior, and database lifecycle rules belong in `nDatabase/database`.

Projects should supply database URIs, credentials, and cluster topology through layered configuration. Framework code must not encode customer-specific database assumptions.
