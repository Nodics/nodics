# How To Use Units And Land Measurements

## What This Capability Solves

Units gives every Nodics business module one consistent way to describe quantities and convert units. It supports pieces, weight, liquid volume, distance, land area, percentages, time, and compound quantities such as kilograms per hectare.

Units is reusable functionality, not necessarily a separate application or
server. Most projects run it in the same process as Inventory, Product, or
Pricing. A dedicated Units deployment is useful only when several independent
runtimes need one centrally governed conversion authority.

Always keep the original value and unit supplied by the source. Store a normalized value separately when a consuming module implements normalization. This preserves legal, survey, supplier, scale, and operator evidence.

## Important Land Rule

Some traditional land-unit names have different sizes in different places. Never assume a universal conversion for bigha, kanal, marla, cent, guntha, or another regional unit. Supply the country and, where required, state/province or locality. The system rejects ambiguous conversion rather than guessing.

Units does not decide which area is legally correct. A property or farm may separately record registered area, surveyed area, polygon-calculated area, usable area, built-up area, carpet area, cultivable area, or irrigated area. The owning real-estate/agriculture module classifies those values; Units converts them.

## Administrator Workflow

1. Define or verify the Dimension and its vector. AREA uses length exponent 2.
2. Define the Unit, symbol, precision, rounding, scope, and lifecycle.
3. For a linear Unit, create an exact numerator/denominator conversion to a recognized Unit of the same dimension.
4. For a regional land Unit, choose country, subdivision, or locality scope and effective dates.
5. Test the intended geography and at least one adjacent/nonmatching geography.
6. Activate only after business/legal verification.
7. Suspend or retire an incorrect rule; never delete a rule referenced by historical data.

The current foundation keeps generated master-data APIs private. An
administrator therefore uses the project's governed initialization/import path
or a project-provided permissioned administration intent. Nodics does not yet
provide a generic human Units-maintenance screen, and projects should not
enable generated CRUD as a shortcut.

## Beginner Example: Grams To Kilograms

Assume `MASS`, gram (`G`), kilogram (`KG`), and the exact conversion
`G_TO_KG` with numerator `1` and denominator `1000` are active. Convert the
canonical string `"1000"` from `G` to `KG`, requesting scale `3` and rounding
`UNNECESSARY`. The result is `"1.000"`.

Do not send the JavaScript number `0.1`. Send `"0.1"` so the source value has
not already lost decimal precision.

## Common Business Uses

| Business need | Units responsibility | Owning business module responsibility |
| --- | --- | --- |
| Hold `2.500 KG` of stock | Validate `KG` and perform exact conversions | Inventory owns balances and movements |
| Sell liquid by litre | Define `VOLUME`, `L`, and governed conversions | Product describes it; Pricing owns price; Inventory owns quantity |
| Store package dimensions | Validate length and weight Unit codes | Product owns packaging meaning |
| Price by kilogram or square metre | Supply the Unit basis and conversions | Pricing owns price selection and money |
| Compare acres and hectares | Convert compatible AREA values | Land/agriculture owns area type and evidence |
| Express kilograms per hectare | Validate a compound dimension vector | Agriculture owns yield meaning |

## Choose Local Or Remote Use

- Choose **co-hosted Units** for the normal case and latency-sensitive
  Inventory, Pricing, or Product operations.
- Choose **remote Units** when independently deployed runtimes need centralized
  definitions and the additional network dependency is acceptable.
- Do not deploy Units separately merely because it is a Nodics module. Modules
  define capability ownership; servers define deployment composition.

Examples in documentation illustrate structure only. Organizations must obtain authoritative local conversion factors from their accepted legal, survey, or industry source.

## Developer Rules

Pass decimal values as strings, never JavaScript numbers. Declare target scale and rounding. Use `UNNECESSARY` when loss of precision must stop the operation. Compare dimension vectors before conversion. Retain conversion identity, geography, effective time, original value/unit, and normalized result in business evidence when the consuming module implements persistence.

Customize through later modules and the `units` properties. Do not create separate UOM tables or conversion services inside Inventory, Product, Pricing, agriculture, or real-estate modules.

When modules run together, they invoke the Units intent service locally.
When Units runs separately, they call its service-token-only conversion
route through Nodics module communication. The result and selection rules are
the same; operators configure topology through `servers.units`, not by
copying Unit data into each domain.

Example remote request:

```http
POST /nodics/units/v0/references/units/convert
Authorization: Bearer <runtime-service-token>
x-enterprise-code: enterpriseA
Content-Type: application/json

{
  "quantity": "1000",
  "fromUnitCode": "G",
  "toUnitCode": "KG",
  "targetScale": 3,
  "roundingMode": "UNNECESSARY"
}
```

The response contains the exact converted quantity plus selected Unit and
conversion evidence. Consumers should retain this evidence when the
calculation has financial, stock, legal, or audit significance.

## Common Problems And Recovery

- **Incompatible dimensions:** correct the source or target Unit; do not add a
  false conversion between mass and volume.
- **Rounding required:** choose an approved rounding mode and target scale, or
  retain `UNNECESSARY` when precision loss must stop processing.
- **Missing geography:** supply the country, subdivision, or locality required
  by the regional rule.
- **Ambiguous regional result:** suspend or correct overlapping definitions;
  never pick one arbitrarily.
- **Unit unavailable:** confirm it is active, effective, and visible to the
  authenticated enterprise.
- **Multi-hop unavailable:** add a governed direct conversion or explicitly
  enable bounded multi-hop conversion after testing its graph.
- **Remote request rejected:** use a runtime service token and verify the active
  `servers.units` connection. Human credentials remain separate.
- **Incorrect conversion discovered:** suspend the bad rule, add a corrected
  effective-dated rule, assess affected evidence, and never silently rewrite
  historical transactions.

## What Operators Should Monitor

Track failures by error code, dimension, geography, enterprise, and correlation
identifier. Monitor latency and availability when Units is remote. Avoid
logging sensitive quantities, prices, or parcel details merely to diagnose a
conversion.

Back up Dimensions, Units, and Conversions together. Restore Dimensions first,
then Units, then Conversions. Test representative business volume in the actual
deployment; framework correctness tests are not universal capacity evidence.

Read the [Units module guide](../../gCore/units/docs/units-foundation.md) for
schemas, arithmetic, regional selection, recovery, and tests, and the
[deployment and integration guide](../../gCore/units/docs/units-deployment-and-integration.md)
for configuration and topology decisions.

## Continue

- Inventory: [How Warehouse Management Works](../commerce/how-to-manage-warehouses.md)
- Data: [How To Work With Data](how-to-work-with-data.md)
- Customization: [How To Customize And Extend Nodics](../development/how-to-customize-and-extend-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
