# Per-schema Versioning Contract

## Authority

The schema-owning module decides whether each of its models requires versioned
persistence. Configure `isVersionedEnabled: true` on that schema. Do not change
the shared `default.base` parent and do not maintain a separate global list of
versioned modules or schemas.

## Runtime behavior

When `vDatabase` is active, it contributes `default.versioned`, which inherits
the ordinary `default.base` contract. Database schema composition applies that
contract only to opted-in schemas and derives `versioned: true` for existing
service and provider implementations.

An enabled schema must fail composition when the versioned contract is absent.
Silent fallback to ordinary persistence could lose history and is forbidden.

## Boundaries

- Version selection is per schema, not per server and not automatically per
  module.
- A module may own both versioned and ordinary schemas.
- `versionId` is persistence history metadata.
- Publishing state, approval state, and workflow concurrency revisions remain
  owned by their respective business authorities.
- Provider modules implement storage mechanics but do not decide which business
  schemas require versioning.

## Required tests

Changes must validate ordinary, enabled, missing-capability, inheritance, and
regression behavior. Provider-specific version operations must additionally run
their provider contract tests.
