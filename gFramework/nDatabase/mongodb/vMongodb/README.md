# vMongodb Module

`vMongodb` is the versioned/publish variant for the MongoDB adapter. It allows MongoDB model behavior to support versioned data and publish-style runtime flows without changing the base `mongodb` adapter.

Use this module when MongoDB needs variant-specific versioned behavior. Keep common MongoDB connection and CRUD behavior in `nDatabase/mongodb`, and keep provider-neutral versioned schema contracts in `nDatabase/database/vDatabase`.

## Capability

The module extends MongoDB model behavior for versioned records. Its versioned model contract verifies that:

- saving a versioned item reads existing items through the standard `getItems` envelope;
- saving inserts the next versioned record;
- updating a versioned item copies existing data, applies the update, increments `versionId`, and inserts a new version instead of mutating the existing one.

This supports publish/revert-style data behavior where previous versions remain available.

## Source Contracts

- `src/schemas/model.js` owns versioned MongoDB model functions.
- `test/versionedModelContract.test.js` verifies versioned save/update behavior.
- `config/properties.js` is currently an empty variant contribution point.
- The module depends on base MongoDB model behavior and provider-neutral versioned schema definitions.

## Extension Path

Projects may customize versioned MongoDB behavior by:

- overriding versioned model functions in a later active module;
- adding versioned data validation or publish-state services in the owning business module;
- configuring runtime publish behavior through project or tenant layers;
- adding tests that prove version creation, lookup, publish, rollback, and tenant isolation.

Do not duplicate base MongoDB connection logic here. This module owns versioned MongoDB behavior only.

## Tests

Run focused versioned MongoDB coverage with:

```bash
node gFramework/nDatabase/mongodb/vMongodb/test/versionedModelContract.test.js
npm run test:basic
npm run quality:docs
```

## What To Avoid

Avoid:

- mutating previous versions when publish/revert behavior requires history;
- bypassing the base MongoDB model envelope;
- putting generic publish workflow rules in this provider variant;
- adding connection credentials to variant configuration;
- changing version increment behavior without focused tests.
