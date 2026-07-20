# vDatabase Module

`vDatabase` is the opt-in versioned variant for the provider-neutral database capability. It contributes schema metadata used by selected runtime models that need staged, published, or revertible data.

Use this module for provider-neutral versioned database contracts. Provider-specific versioned behavior belongs in provider variants such as `mongodb/vMongodb`.

## Capability

The module contributes schema metadata under `default.versioned`:

- `versioned: true`;
- required `versionId`;
- a unique `versionId` index contribution;
- inheritance from the ordinary `default.base` contract.

This establishes a source definition for versioned data without making every persistent schema versioned. An owning module enables the capability independently on each schema with `isVersionedEnabled: true`. The runtime then composes the versioned contract and exposes the existing internal `schemaModel.versioned` flag consumed by version-aware services and providers.

```js
module.exports = {
    catalog: {
        catalog: {
            super: 'base',
            isVersionedEnabled: true,
            model: true
        },
        catalogUserPreference: {
            super: 'base',
            model: true
        }
    }
};
```

Here `catalog.catalog` is versioned, while `catalog.catalogUserPreference` remains an ordinary model. Configuration belongs to the module that owns the schema and remains overrideable through later schema contributions.

## Source Contracts

- `src/schemas/schemas.js` owns the versioned schema metadata.
- `src/pipelines/pipelines.js` is the versioned database pipeline extension slot.
- `config/properties.js` is currently an empty variant contribution point.
- Provider variants implement provider-specific versioned model behavior.

## Extension Path

Projects may extend versioned database behavior by:

- setting `isVersionedEnabled: true` only on business schemas that require version history;
- contributing publish, approval, rollback, or activation services in the owning business module;
- using provider variants for database-specific version storage behavior;
- adding tests for version creation, publish state, rollback, tenant isolation, and export behavior.

Keep business publish lifecycle rules out of this baseline module unless they are truly provider-neutral framework contracts.

## Tests

Run:

```bash
npm run test:generated
npm run test:basic
npm run quality:docs
```

Provider-specific behavior should also run provider variant tests, such as the MongoDB versioned model contract.

## What To Avoid

Avoid:

- putting business catalog publish rules into this provider-neutral variant;
- enabling versioning globally for every schema merely because `vDatabase` is active;
- making `versionId` behavior provider-specific here;
- mutating previous versions when history is required;
- adding generated artifacts manually;
- using this module as a general data lifecycle bucket.
