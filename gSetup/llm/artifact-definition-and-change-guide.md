# Artifact Definition And Change Guide

This guide explains how developers and LLMs should define or change Nodics
properties, schemas, routers, services, and complete functionality. All artifact
types follow the active module hierarchy, but their composition and lifecycle
rules are different. Do not describe every artifact as if it uses the same merge
mechanism.

## Shared Hierarchy Contract

Framework modules provide default capability and behavior. Later-loaded project,
environment, server, and node modules may contribute or override the effective
implementation without editing out-of-the-box Nodics code.

For every change:

1. Identify the owning capability and source module.
2. Choose the artifact type that owns the decision.
3. Define the default at the lowest correct reusable layer.
4. Document how a later module changes the effective behavior.
5. Add a focused override/customization test.
6. Regenerate only source-derived artifacts and verify clean/build when applicable.

Configuration selects values and policy. Schemas describe data contracts and
generation metadata. Routers describe transport contracts. Services implement
replaceable behavior. Do not move business behavior into properties or route
definitions merely to make it configurable.

## Configuration Properties

Define module configuration in `config/properties.js` as a declarative export:

```js
module.exports = {
    returnErrorStack: true,
    externalDataLocation: NODICS.getServerPath() + '/data',
    defaultErrorCodes: {
        NodicsError: 'ERR_SYS_00000'
    }
};
```

The configuration initializer loads active modules in index order and deep-merges
their exports. A later module may redefine one key or nested key while inheriting
the remaining defaults.

Do not treat every layered artifact as a plain property merge. Ordinary
configuration files, script maps, utility maps, and many named
service/facade/controller/pipeline contributions use active-module merge order.
Schemas, routers, and their runtime persisted contributions use governed merge
helpers that preserve override metadata, removals, warnings, and traceability.
Choose the artifact-specific composition contract before writing code.

Property requirements:

- document owner, type, default, validation, sensitivity, and restart/runtime behavior
- prefer stable data over executable business logic
- keep secrets in governed external or runtime sources
- avoid customer/project assumptions in framework defaults
- place benchmark, diagnostic, timeout, size, threshold, and workload assumptions in layered properties when companies or projects may need different values
- use a resolver or replaceable service when a value depends on substantial runtime logic
- define and test array, `null`, deletion, and type-change semantics before relying on them

Ordinary properties are merged during startup/runtime loading. Clean/build is
required only when effective property values participate in generated output.

## Schemas

Define schema contributions in `src/schemas/schemas.js` using the
`moduleName -> schemaName` hierarchy. Schemas own data shape, inheritance,
persistence/service/router generation flags, access metadata, ownership, cache,
search, references, validation metadata, and property documentation.

Schema contributions use governed composition:

- additive changes use the default merge mode
- intentional replacement uses `$override.mode: 'replace'`
- inherited properties are removed through `$override.removeProperties`
- intentional type or required-contract changes declare
  `$override.allowBreakingChanges: true`
- effective definitions retain override traceability

After a schema change, review generated models, services, facades, controllers,
routes, tests, OpenAPI/governance output, persistence compatibility, migration or
backfill needs, tenant behavior, access policy, import/export, and clean/build
recreation. Runtime schema contributions must use the governed runtime schema
path rather than a second loader.

## Routers

Define static route contributions in `src/router/router.js` using the existing
module/group/route registry shape. A route contract should declare its path key,
HTTP method, controller or handler, operation, security/access metadata, cache
policy when relevant, and help/documentation metadata.

Router contributions use governed composition:

- additive or partial changes use the default merge mode
- intentional group or route replacement uses `$override.mode: 'replace'`
- inherited routes are removed through `$override.removeRoutes`
- intentional breaking changes declare `$override.allowBreakingChanges: true`
- effective definitions retain override traceability

Changing a route requires review of controller mapping, facade/service behavior,
request validation, authentication and authorization, tenant context, response
and error contracts, OpenAPI/help metadata, backward compatibility, and route
override tests. Runtime route contributions must use the governed runtime router
path.

When a route enables cache, treat it as router/API-response cache. Verify the
cache key includes the resolved tenant and governed principal/access context,
the cached value preserves the standard response envelope, and schema mutations
invalidate the affected router cache through layered channel resolution.

## Services

Define handwritten services under `src/service/**` with filenames ending in
`Service.js`. The filename establishes the runtime service name. Active modules
are loaded in hierarchy order; when a later module contributes the same service
name, its exported methods and fields are merged over the earlier service while
omitted members remain inherited.

Service requirements:

- keep the service name and public method contract stable unless a governed breaking change is approved
- override the smallest necessary method instead of copying the complete core service
- keep orchestration, persistence, transport, and policy responsibilities at their correct boundaries
- preserve request, tenant, security, audit, diagnostics, and error context
- do not edit generated services under generated directories
- use schema metadata and build when the service is schema-generated; use a later handwritten service contribution when behavior is custom
- add base behavior, negative/failure, and later-layer method override tests

Handwritten services are runtime-loaded source and must not be removed by clean.
Schema-generated services are derived artifacts and must be recreated by build.

## Cache-Aware Changes

Cache behavior is a cross-layer contract, not a single implementation detail.
Nodics has router/API-response cache in the request pipeline and DAO/schema-item
cache in the database get pipeline.

When adding or changing a cacheable feature:

- define cache policy at the owning source artifact: route metadata for
  router/API-response cache, schema metadata for DAO/schema-item cache
- keep adapters, TTL behavior, physical key construction, and invalidation in
  `nCache` services so project modules can override them through hierarchy
- verify tenant isolation for both layers and principal/access isolation for
  router/API-response cache
- preserve response envelopes and do not mutate caller-owned or cached values
- re-apply runtime schema/property access policies to DAO/schema-item cache hits
- route cache write eligibility through the cache policy service and layered
  `cache.cacheability` properties instead of hardcoding payload or sensitivity
  rules in router, DAO, adapter, or test code
- route search query cache write eligibility through the same cache policy
  service; search cache is a specialized query-result cache, not a separate
  governance path
- preserve `cachePolicyDecision.reason` and `cachePolicyDecision.reasonCode`
  for every accepted or skipped cache write so diagnostics can use stable
  governance codes
- keep framework-owned reason codes in the owning module's
  `src/utils/statusDefinitions.js` as `RSN_*` definitions; do not place
  canonical code catalogs in layered behavior properties
- add project-specific cacheability rules with ordered
  `cache.cacheability.policyHandlers` that point to layered services before
  considering a full core policy-service override
- invalidate both router/API-response and DAO/schema-item cache on schema save,
  update, and remove through `DefaultCacheService.invalidateResource`
- test Local behavior deterministically and Redis behavior through the guarded
  live Redis gate when validating release readiness

## Functionality Change-Impact Matrix

Legend: **M** mandatory, **C** conditional review/change, **G** generated output,
**R** runtime/layered composition, **-** normally unaffected.

| Change type | Properties | Schema | Generated artifacts | Router | Controller/facade | Service/pipeline | Security/tenant | Data/migration | Docs/tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Add or change configuration value | M/R | - | C/G | C | C | C | C | - | M |
| Add schema property | C | M/R | M/G | C/G | C/G | C/G | M | M/C | M |
| Change schema type, required flag, inheritance, or removal | C | M/R | M/G | C/G | C/G | C/G | M | M | M |
| Add or change generated CRUD capability | C | M/R | M/G | M/G | M/G | M/G | M | C | M |
| Add custom API operation | C | C | - | M/R | M | M | M | C | M |
| Change business behavior without API/data change | C | - | - | - | C | M/R | C | - | M |
| Add cross-module functionality | M/C | M/C | C/G | M/C | M/C | M/R | M | C | M |
| Add governed runtime behavior | M/C | C/R | C/G | C/R | C | M/R | M | C | M |

The matrix classifies layers as mandatory, conditional, generated, runtime-merged, and unaffected.
It is a review trigger, not permission to edit every column. Inspect the actual
ownership path and change only mandatory or genuinely affected layers.
Unnecessary parallel abstractions make Nodics harder for human developers to
understand and override.

## Completion Checklist

A property, schema, router, service, or functionality change is complete only
when:

- effective ownership and hierarchy order are clear
- the correct source definition and composition mechanism are used
- later-layer customization works without core edits
- generated versus handwritten lifecycle is respected
- security, tenant, validation, audit, diagnostics, and compatibility impacts are resolved
- documentation explains both the default behavior and customization path
- focused behavior and override/customization tests pass
- clean/build and consolidated/modular tests pass when the affected lifecycle requires them
