# Example: Adding A Provider Implementation

Use this example when a developer asks to add a new database, cache, search engine, messaging provider, storage provider, email provider, payment gateway, or infrastructure adapter.

## Scenario

Add Oracle as a database provider behind the existing database capability.

## Correct Ownership

Separate the capability from the implementation.

- The provider-neutral capability remains owned by the existing framework module, such as `nDatabase`, `nSearch`, `nCache`, or `nEms`.
- The provider-specific implementation belongs in a provider module or customer project module.
- Project activation belongs in layered module metadata and `config/properties.js`.
- Credentials, endpoints, pools, timeouts, namespaces, topics, indexes, and database names must not be hardcoded.

## Correct Layering

Use this order:

1. Identify the provider-neutral capability contract.
2. Create or use a provider/project module for the implementation.
3. Add provider defaults in the provider module's `config/properties.js`.
4. Add connection lifecycle services under loader-visible `src/service` paths.
5. Add DAO, adapter, handler, exporter, indexer, cache, or messaging behavior required by the capability contract.
6. Add tenant/environment/server/node override behavior through configuration.
7. Add health, diagnostics, redaction, and failure handling.
8. Add deterministic contract tests and optional live-provider tests.
9. Update provider README, integration guidance, and generated LLM context.

## Configuration Contract

Provider selection and connection data come from layered configuration:

```js
module.exports = {
    database: {
        providers: {
            oracle: {
                enabled: false,
                connectionSecretPath: 'database.oracle.connection',
                pool: {
                    min: 1,
                    max: 10
                },
                timeoutMs: 30000
            }
        }
    }
};
```

Use the real property namespace owned by the target capability. The example above shows the shape of the decision, not a required exact key.

## Tests

Add tests for:

- provider selection from configuration;
- connection lifecycle success and failure;
- tenant-aware resolution;
- DAO or adapter behavior through the provider-neutral contract;
- sanitized diagnostics;
- disabled or unsupported provider behavior;
- later-module override behavior;
- live-provider behavior only behind an explicit integration/release gate.

## Verification

```bash
npm run test:config
npm run test:basic
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Run provider-specific tests when they exist. Do not require live external infrastructure for normal basic tests.

## What To Avoid

Avoid:

- changing provider-neutral business code just to call a provider library directly;
- hardcoding credentials, URLs, queue names, database names, or index prefixes;
- making a live provider required for basic tests;
- adding a second configuration file when `config/properties.js` can own the setting;
- bypassing tenant/environment/server/node override behavior;
- using MCP or external tools as hidden configuration sources.
