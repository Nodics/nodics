# vService Module

`vService` is the publish/runtime variant module for the `nService` capability. It allows service behavior or activation defaults to vary by runtime package without changing the base service framework module.

Use this module for variant-level service wiring and configuration. Shared service contracts, service orchestration, and reusable service utilities belong in `nService`.

Variant changes should be minimal, layered, and test-backed. Avoid duplicating base service logic unless the runtime variant owns a deliberate override.

## Capability Status

The module currently provides a standard variant module boundary:

- layered configuration files;
- router, schema, pipeline, utility, enum, and status extension slots;
- a sample service scaffold;
- common and environment-local smoke tests;
- generated LLM context.

It does not replace the base service framework by default. It is a controlled location for variant-specific service behavior when a runtime package needs a different service activation profile.

## Extension Path

Use `vService` when a variant must:

- activate different service behavior for a versioned/publish runtime;
- add variant-only pipelines or router metadata;
- override a base service through the normal active-module hierarchy;
- contribute variant-specific configuration without modifying `nService`;
- test a publish/runtime service path independently from the base service module.

Keep provider-neutral service contracts in `nService`. Keep business publish lifecycle rules in the owning business module unless the rule is a true framework contract.

## Tests

Run:

```bash
npm run structure:audit -- --fail
npm run quality:docs
```

Add focused tests when this variant starts owning runtime behavior beyond scaffold extension slots.

## What To Avoid

Avoid:

- copying base `nService` logic without a clear variant-owned reason;
- adding business module logic here;
- hiding service overrides outside `src/service`;
- changing generated artifacts manually;
- enabling a variant behavior without tests proving the override path.
