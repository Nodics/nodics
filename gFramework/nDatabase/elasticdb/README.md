# elasticdb Module

`elasticdb` is the Elasticsearch database adapter module for `nDatabase`. It provides provider-specific database wiring where framework database contracts need an Elasticsearch-backed implementation.

Use this module for Elasticsearch database adapter behavior only. General search behavior belongs in `nSearch`, and shared database lifecycle, schema access policy, and generated CRUD contracts belong in `nDatabase/database`.

Provider endpoints and credentials must be supplied by layered configuration. Keep framework defaults generic and test-backed so projects can replace or override the adapter safely.
