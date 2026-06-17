# Schema And Generation

## Schema-Driven Platform

Nodics uses schema definitions as source metadata for models, services, routers, APIs, tests, and documentation.

Schemas are layered by active module hierarchy. The effective schema is created by merging schema definitions from included modules in load order.

Schema structure follows:

```js
module.exports = {
    moduleName: {
        schemaName: {
            super: 'base',
            model: true,
            service: { enabled: true },
            router: { enabled: true },
            definition: {}
        }
    }
};
```

The `moduleName -> schemaName` structure is intentional. A later project/environment/server/node module can add or modify a schema under an existing module namespace, and generated artifacts should reflect the final effective schema.

Example:

If a project module adds one property to `profile.tenant`, the generated profile tenant model/service/API/tests should include that property after clean/build. The project should not edit the core profile schema file.

## Generated Artifacts

Generated artifacts are derived outputs. They must be created by build and safely removable by clean.

Do not manually maintain generated files as source of truth.

Common generated outputs include:

- schema contracts
- model definitions
- generated services
- generated facades/controllers/routers where applicable
- generated route contracts
- generated API scenario tests
- generated CRUD tests
- generated OpenAPI/governance outputs

## Clean And Build Rules

Run clean/build when schema, router, generated test, generated docs, or generation logic changes.

Expected behavior:

1. `npm run clean` removes generated artifacts.
2. `npm run build` recreates generated artifacts from source definitions.
3. tests validate regenerated output.

If generated output only works before clean/build, the implementation is wrong.

## Router Definitions

Router definitions are also layered. Route definitions should live in the owning module unless they are runtime persisted routes governed by `nDynamo`.

Router definitions should include:

- `key`
- `method`
- `controller`
- `operation`
- `secured`
- `accessGroups` or permission metadata when appropriate
- `help` metadata for API/documentation generation

## Import Run History Example

Recent modernization added `import.importRun` as a schema-driven model owned by the import module.

The handwritten `DefaultImportRunHistoryService` uses generated `DefaultImportRunService` for persistence. This keeps import history:

- schema-driven
- generated through build
- removable through clean
- overrideable through later modules
- visible through control-plane APIs

## Generation Safety Checklist

Before completing a generation-related change:

1. Confirm source definitions live in the correct module.
2. Confirm no customer/project name is hardcoded in framework logic.
3. Run `npm run clean`.
4. Run `npm run build`.
5. Run focused tests.
6. Run generated tests.
7. Run `npm run test:basic`.
