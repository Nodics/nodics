# mongodb Module

`mongodb` is the MongoDB adapter module for `nDatabase`. It owns MongoDB connection defaults, provider handler wiring, MongoDB model behavior, schema/model adapter slots, and provider-specific pipeline extension points.

Use this module when implementing or changing MongoDB-specific database behavior. Shared DAO contracts, schema access policy, generated CRUD behavior, tenant database validation, and provider-neutral database lifecycle rules belong in `nDatabase/database`.

## Capability

The module contributes MongoDB defaults under `database.default.mongodb`, including:

- connection handler service name;
- schema handler service name;
- model handler service name;
- interceptor handler service name;
- MongoDB-supported schema properties;
- default index behavior;
- save, update, and remove operation options;
- master and test database connection defaults.

It also contributes `src/schemas/model.js`, which provides the MongoDB model operations used by generated services:

- `getItems`;
- `saveItems`;
- `updateItems`;
- `removeItems`.

## Runtime Flow

1. The database capability resolves the active database provider from layered configuration.
2. MongoDB connection, schema, model, and interceptor handlers are selected from `database.default.mongodb.options`.
3. Tenant and module database configuration are validated by the provider-neutral database layer.
4. Generated services call provider-neutral database abstractions.
5. MongoDB model functions translate those requests into MongoDB operations such as `find`, `findOneAndUpdate`, `insertOne`, `updateMany`, and `deleteMany`.

## Configuration

MongoDB configuration must remain layered. Do not hardcode project database names, credentials, cluster URLs, TLS settings, or pool settings in source code.

Default shape:

```js
module.exports = {
    database: {
        default: {
            mongodb: {
                options: {
                    connectionHandler: 'DefaultMongodbDatabaseConnectionHandlerService',
                    schemaHandler: 'DefaultMongodbDatabaseSchemaHandlerService',
                    modelHandler: 'DefaultMongodbDatabaseModelHandlerService',
                    interceptorHandler: 'DefaultMongodbDatabaseInterceptorHandlerService'
                },
                master: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'nodicsMaster'
                },
                test: {
                    URI: 'mongodb://127.0.0.1:27017',
                    databaseName: 'nodicsTest'
                }
            }
        }
    }
};
```

Projects must override connection values through project, environment, server, node, tenant, or secret-governed configuration.

## Extension Path

Projects may customize MongoDB behavior by:

- overriding `database.*.mongodb` configuration in later modules;
- contributing a different connection, schema, model, or interceptor handler service;
- overriding MongoDB model behavior in a later active module;
- adding MongoDB-specific pipelines in `src/pipelines/pipelines.js`;
- adding focused tests for tenant database resolution and provider behavior.

If a project needs another database such as Oracle, add a provider module that implements the database contract instead of putting Oracle-specific behavior into this MongoDB adapter.

## Tests

MongoDB participates in the database and generated CRUD test suites. Versioned MongoDB behavior is covered in `mongodb/vMongodb/test/versionedModelContract.test.js`.

Run:

```bash
npm run test:config
npm run test:generated
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- hardcoding customer database URIs or credentials;
- mixing provider-neutral database rules into MongoDB-specific services;
- adding Oracle, Cassandra, or Elasticsearch behavior to this adapter;
- changing MongoDB model operation envelopes without generated service tests;
- bypassing tenant database configuration validation;
- editing generated CRUD artifacts manually.
