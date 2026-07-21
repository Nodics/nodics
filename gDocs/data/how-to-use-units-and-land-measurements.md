# How To Use Units And Land Measurements

## What This Capability Solves

Units gives every Nodics business module one consistent way to describe quantities and convert units. It supports pieces, weight, liquid volume, distance, land area, percentages, time, and compound quantities such as kilograms per hectare.

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

Examples in documentation illustrate structure only. Organizations must obtain authoritative local conversion factors from their accepted legal, survey, or industry source.

## Developer Rules

Pass decimal values as strings, never JavaScript numbers. Declare target scale and rounding. Use `UNNECESSARY` when loss of precision must stop the operation. Compare dimension vectors before conversion. Retain conversion identity, geography, effective time, original value/unit, and normalized result in business evidence when the consuming module implements persistence.

Customize through later modules and the `units` properties. Do not create separate UOM tables or conversion services inside Inventory, Product, Pricing, agriculture, or real-estate modules.

When modules run together, they invoke the Units intent service locally.
When Units runs separately, they call its service-token-only conversion
route through Nodics module communication. The result and selection rules are
the same; operators configure topology through `servers.units`, not by
copying Unit data into each domain.

Read the [Units module guide](../../gCore/units/docs/units-foundation.md) for schemas, arithmetic, regional selection, recovery, and tests.

## Continue

- Inventory: [How Warehouse Management Works](../commerce/how-to-manage-warehouses.md)
- Data: [How To Work With Data](how-to-work-with-data.md)
- Customization: [How To Customize And Extend Nodics](../development/how-to-customize-and-extend-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
