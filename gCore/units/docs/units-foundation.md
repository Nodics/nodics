# Units Foundation

## Purpose And Ownership

Units supplies exact numbers, dimensions, UOM definitions, conversion factors, regional meaning, and rounding. Inventory owns stock; Product owns packaging meaning; Pricing owns money per unit; agriculture owns field/crop/yield meaning; real estate owns parcels, title, zoning, legal/surveyed/built-up/carpet/cultivable area classifications; geospatial modules own coordinates and polygons.

A polygon-calculated area, surveyed area, registered area, and operator-entered area may differ. Keep each value with its evidence/source and use Units only to normalize or compare it.

Units is normally co-hosted with its consuming business modules. Its separate
service route is an optional transport choice, not a requirement that every
Nodics module run on a different server. See
[Units Deployment And Integration](units-deployment-and-integration.md).

## Exact Value Contract

Callers provide canonical decimal strings such as `12`, `12.500`, or `-0.25`. Numbers such as JavaScript `0.1` are rejected because they may already contain binary floating-point error. Conversion factors use positive integer `numerator` and `denominator`. The exact service multiplies through BigInt and applies an explicit target scale and rounding mode.

Supported rounding defaults are `UNNECESSARY`, `DOWN`, `UP`, `HALF_UP`, and `HALF_EVEN`. `UNNECESSARY` rejects any operation that loses precision. The default maximum output scale is 18 and is layered configuration.

## Dimensions And Compound Units

Default dimensions include COUNT, MASS, VOLUME, LENGTH, AREA, TIME, and PERCENTAGE. A `dimensionVector` records integer base exponents: area is `{ LENGTH: 2 }`; velocity can be `{ LENGTH: 1, TIME: -1 }`; crop yield can be `{ MASS: 1, LENGTH: -2 }`. Conversions require equal normalized vectors.

Derived Unit components describe unit codes and integer exponents. A domain may therefore represent kilograms per hectare, litres per square metre, price per square foot, or livestock per acre without changing Units ownership.

## Regional Land Units

A traditional name such as bigha may have different legal conversion factors by country, state/province, district, or locality. `unitConversion` supports GLOBAL, COUNTRY, SUBDIVISION, and LOCALITY scopes plus effective dates. Selection chooses exactly one most-specific active rule. Two equally specific matches are an error. Missing required geography is an error.

Standard examples such as square metre, square foot, acre, and hectare normally use global conversions. Region-dependent names such as bigha, kanal, marla, cent, or guntha must be configured only with verified local/legal factors; the framework does not claim one universal value.

## Data And Lifecycle

Dimensions, units, and conversions may be GLOBAL or ENTERPRISE scoped. Enterprise definitions require a matching authenticated enterprise. Codes are stable and internal identities are derived. Definitions begin in DRAFT and are intended to move through ACTIVE, SUSPENDED, and RETIRED states. Hard deletion is rejected so historical business evidence stays interpretable.

Generated services are internal and generated CRUD routers are disabled. The
implemented module-internal route
`POST /nodics/units/v0/references/units/convert` accepts a
canonical quantity, source Unit, target Unit, target scale, optional rounding,
geography, and effective time. It requires a Nodics service token and returns
an allow-listed exact result plus selected Unit and conversion evidence.

The implemented module does not expose a human master-data administration API.
Projects currently contribute governed definitions through existing Nodics
initialization/import mechanisms or add a narrowly secured later-layer intent.
Do not enable generic generated CRUD merely to obtain an administration screen.

The same `DefaultUnitsReferenceService.convertInternal` contract is used
when caller and Units are co-hosted. Separately deployed callers use the
route through `DefaultModuleService` and `servers.units`; this changes
transport only, not authority or conversion behavior.

Selection prefers an authenticated ENTERPRISE Unit over GLOBAL fallback. For
conversions it first chooses the most-specific matching geography and then an
ENTERPRISE definition over a GLOBAL definition at the same geography. Direct
and reverse factors are supported. Missing, hidden, incompatible, excessive,
or ambiguous results fail closed.

Optional multi-hop conversion is configured under `units.referenceConversion` and is disabled by default. When enabled, Units builds a bounded graph from visible, active, effective conversion records, selects one scoped rule per edge, and chooses one unambiguous shortest path. Factors are composed and reduced as exact integers before a single rounding step. Cycles, graph size, hop count, factor digits, and ambiguous shortest paths fail closed.

## Customization

Use later-layer `units` properties to extend dimensions, unit kinds, rounding modes, scale limits, or geographic levels where safe. Add definitions through project data/schema layers. Replace the smallest arithmetic or selection provider only when necessary and preserve canonical strings, exact factors, compatibility, deterministic specificity, and failure behavior.

`units.referenceConversion.requireServiceToken` and
`maximumDefinitionResults`, `multiHopEnabled`, `maximumHops`, and
`maximumGraphConversions` govern the internal route and bounded reads. A
project may replace the reference service or transport facade in a later module,
but it must retain exact arithmetic, visibility rules, deterministic selection,
service-only access, and the allow-listed response.

Never copy the registry into Inventory, agriculture, real estate, Product, Pricing, or another module. Those modules should retain their business classification and reference Units codes.

## Security, Operations, And Recovery

Keep enterprise definitions scoped to authenticated claims. Treat conversion changes as governed master-data changes because they affect stock, land, yield, and price calculations. Audit activation and retirement, monitor ambiguity/incompatibility/rounding errors, and never log sensitive parcel or commercial payloads merely to diagnose arithmetic.

Back up all three collections together. Restore Unit and Dimension definitions before conversions. Historical transactions should retain original value/unit plus normalized value, scale, rounding, conversion code/version, geography, and calculation time when consuming modules implement them.

## Verification

```bash
node gCore/units/test/exactUnitsAndRegionalConversion.test.js
node gCore/units/test/unitsFoundationContract.test.js
node gCore/units/test/unitsReferenceConversionContract.test.js
npm run llm:generate
npm run llm:validate
npm run quality:docs
npm run build
npm run test:basic
```

Tests cover exact positive/negative arithmetic, repeating factors, mandatory
rounding, half-up/even boundaries, numeric-input rejection,
compatible/incompatible compound vectors, regional land specificity,
ambiguity, enterprise scope, malformed factors/geography, configuration
extension, private generated CRUD, secured intent routing, direct/reverse
conversion, and no-hard-delete behavior.
