# Units

Units is Nodics' domain-neutral authority for exact measured values, dimensions, units of measure, compound dimension vectors, rounding, and geographically scoped conversions.

It supports count, mass, volume, length, area, time, percentage, custom dimensions, derived units, and regional land units. Commerce Inventory, agriculture, real estate, pricing, shipping, and future domains can reuse it without creating separate UOM registries.

Units is a capability module, not a requirement to operate a dedicated Units
server. The normal topology is to activate it in the same runtime as Inventory,
Product, or Pricing. A separate deployment is optional when an enterprise needs
one remotely governed conversion authority shared by multiple runtimes.

Authoritative values are canonical decimal strings. Conversion factors are positive integer numerator/denominator pairs. Exact arithmetic uses BigInt and declared rounding, never JavaScript floating point.

Implemented schemas are `unitDimension`, `unitOfMeasure`, and
`unitConversion`. Generated CRUD routers remain disabled. A narrow
service-token-only `POST /references/units/convert` intent route lets
other Nodics modules use the same exact conversion authority when Units
is deployed separately.

The intent service supports same-Unit normalization, direct and inverse exact
factors, optional bounded multi-hop conversion, enterprise-over-global definition selection, geographic specificity,
effective dates, dimensional compatibility, bounded reads, and explicit
rounding. It returns only the Unit and conversion evidence a consuming domain
needs; it does not expose Units master-data CRUD.

Read [Units Foundation](docs/units-foundation.md), the
[deployment and integration guide](docs/units-deployment-and-integration.md),
and the [business guide](../../gDocs/data/how-to-use-units-and-land-measurements.md).

## Verification

```bash
node gCore/units/test/unitsReferenceConversionContract.test.js
node gCore/units/test/unitsMultiHopConversionContract.test.js
node gCore/units/test/exactUnitsAndRegionalConversion.test.js
node gCore/units/test/unitsFoundationContract.test.js
```
