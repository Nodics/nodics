# Versioned Data And Publish Lifecycle

Versioning and publishing are platform capabilities. The exact business workflow
is negotiable by project, but the contract must remain layered, governed,
tenant-aware, auditable, testable, and overrideable without modifying
out-of-the-box Nodics framework code.

## Current Capability Roles

`gFramework/nDatabase/database/vDatabase` owns the provider-neutral versioned
schema layer:

- contributes the `versioned` base schema contract;
- adds the `versionId` field;
- provides the `base` schema super type extending `versioned`;
- initializes missing `versionId` through the version id interceptor.

`gFramework/nDatabase/mongodb/vMongodb` owns MongoDB-specific versioned
persistence behavior:

- `saveVersionedItems`;
- `updateVersionedItems`;
- latest-version lookup;
- version increment validation;
- insert-new-version behavior instead of mutating the previous version.

`gFramework/nService/vService` owns service-pipeline routing for version-aware
generated operations:

- detects `request.schemaModel.versioned`;
- delegates save/update to versioned persistence when enabled;
- preserves normal save/update behavior for non-versioned schemas.

`gFramework/nPublish` owns generic publishing contracts that should not be tied
to one database provider or business domain.

## Activation Contract

A schema becomes version-aware when the effective schema/model is marked
`versioned: true`. The generated model handler exposes this as
`schemaModel.versioned`, and `vService` uses that flag during generated save and
update processing.

Current implemented flow:

1. Schema inherits or declares versioned behavior.
2. `vDatabase` contributes the version field and base schema contract.
3. The active database adapter, currently `vMongodb`, provides versioned
   persistence functions.
4. `vService` routes generated save/update operations to versioned persistence
   when the schema model is versioned.
5. Each change creates a new version instead of overwriting existing data.

## Business Lifecycle Target

The intended enterprise publish story is:

1. A business user creates or changes data in a staged/versioned area.
2. Validation rules, workflows, permissions, and preview APIs verify staged data.
3. Authorized approvers publish approved data to the online/runtime channel.
4. Online consumers read the active published version.
5. Audit, rollback, diagnostics, and traceability show who changed, validated,
   approved, published, or reverted data.

The current framework has versioned persistence foundations. Projects and future
framework work must not describe the full business publish lifecycle as complete
until staged/online separation, validation, approval, publish activation,
consumer selection, rollback, cache/search invalidation, and permissions are
implemented and tested for the affected domain.

## Design Decisions Still Required

Before implementing a full publish lifecycle, define:

- how staged and online data are separated: channel, version flag, published
  status, tenant, collection, or another governed contract;
- where validation results are stored;
- which workflow or approval service owns approve/reject/publish;
- how online APIs select only the active published version;
- how rollback selects and reactivates a prior version;
- how cache, search, and index invalidation run after publish or rollback;
- which permissions separate creators, validators, approvers, publishers, and
  runtime consumers;
- how the lifecycle behaves across tenant, environment, server, node, and
  modular deployment boundaries.

## Developer Checklist

When adding versioned or publishable data:

1. Decide whether the schema should be versioned.
2. Mark the effective schema/model with `versioned: true` through the owning
   schema contribution.
3. Use generated service/DAO paths so `vService` and the active database adapter
   can apply versioned behavior.
4. Define staged versus online visibility before exposing runtime consumers.
5. Add validation, approval, publish, rollback, audit, diagnostics, and
   permission rules at the owning module or project layer.
6. Test version creation, version ordering, tenant isolation, publish visibility,
   rollback, cache/search invalidation, and later-module override behavior.

## AI Tool Checklist

Before advising or changing versioned/publish behavior, AI tools must identify:

- the owning schema and module;
- whether the request is only versioned persistence or full staged/online
  publish lifecycle;
- active database provider and adapter capability;
- tenant and permission boundaries;
- workflow/approval owner;
- generated artifacts affected by the schema or service change;
- tests proving versioning, publish visibility, rollback, and tenant isolation.

AI tools must not implement ad hoc publish flags in business services when the
behavior belongs in schema metadata, generated service flow, publish governance,
or an owning workflow/approval service.
