# vDatabase Module

`vDatabase` is the versioned/publish variant for the provider-neutral database capability. It contributes versioned base schema metadata used by runtime flows that need staged, published, or revertible data.

Use this module for provider-neutral versioned database contracts. Provider-specific versioned behavior belongs in provider variants such as `mongodb/vMongodb`.

## Capability

The module contributes schema metadata under `default.versioned`:

- `versioned: true`;
- required `versionId`;
- a unique `versionId` index contribution;
- `default.base` extending the versioned schema.

This establishes a source definition for versioned data. Business modules can build publish/revert lifecycle behavior on top of this foundation without changing provider-neutral database services.

## Source Contracts

- `src/schemas/schemas.js` owns the versioned schema metadata.
- `src/pipelines/pipelines.js` is the versioned database pipeline extension slot.
- `config/properties.js` is currently an empty variant contribution point.
- Provider variants implement provider-specific versioned model behavior.

## Extension Path

Projects may extend versioned database behavior by:

- adding business schemas that inherit the versioned base contract;
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
- making `versionId` behavior provider-specific here;
- mutating previous versions when history is required;
- adding generated artifacts manually;
- using this module as a general data lifecycle bucket.
