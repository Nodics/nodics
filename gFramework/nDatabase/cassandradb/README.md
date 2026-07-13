# cassandradb Module

`cassandradb` is the Cassandra database adapter module for `nDatabase`. It provides provider-specific configuration, schemas, routes, and pipeline hooks needed to connect Nodics database contracts to Cassandra.

Use this module for Cassandra-specific connection, query, and model behavior. Shared DAO, schema access policy, generated CRUD, and database lifecycle contracts belong in `nDatabase/database`.

Credentials, endpoints, and deployment topology must come from layered configuration. Do not hardcode environment-specific provider details in framework code.
