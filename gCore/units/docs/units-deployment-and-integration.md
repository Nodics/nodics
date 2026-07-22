# Units Deployment And Integration

## Choose A Topology

A Nodics module defines ownership, configuration, extension, and testing. It
does not require a dedicated server. Choose transport independently from
capability ownership.

| Situation | Recommended topology | Reason |
| --- | --- | --- |
| Inventory is the only current consumer | Co-host `units` with `inventory` | Lowest latency and no network dependency |
| Product or Pricing also needs conversion in the same runtime | Co-host one `units` module with those active modules | All consumers use one in-process authority |
| Several independently scaled runtimes require centrally governed definitions | Deploy Units separately and configure each consumer's Units connection | One remote authority without copying definitions |
| A consumer only stores a Unit code and performs no conversion | Keep the reference and validate through its configured provider | The consumer must not create its own registry |

Running Units by itself is technically supported but usually provides no
business outcome until a domain such as Inventory, Product, Pricing, shipping,
agriculture, or real estate consumes it.

## Co-hosted Consumption

Activate `units` in the consuming runtime's module composition. The consumer's
configured provider calls `DefaultUnitsReferenceService.convertInternal`.
There is no HTTP hop, but Units remains the authority. Do not call generated
Unit persistence services from domain logic.

Conceptual input:

```json
{
  "quantity": "1000",
  "fromUnitCode": "G",
  "toUnitCode": "KG",
  "targetScale": 3,
  "roundingMode": "UNNECESSARY"
}
```

The exact result is `1.000 KG`. The actual response also includes the selected
Unit and conversion evidence so the consumer can retain traceability.

## Remote Consumption

When Units is deployed separately, the consuming module uses
`DefaultModuleService`, its configured `servers.units` connection, and the
runtime service token to call:

```text
POST /nodics/units/v0/references/units/convert
Authorization: Bearer <runtime service token>
x-enterprise-code: <authenticated enterprise>
```

The route accepts only `quantity`, Unit codes, target scale, rounding mode,
optional geography, and effective time. It does not expose master-data CRUD.
A human username/password or access token is not a substitute for the service
token.

Configure the connection in the active environment/server `properties.js`.
Do not put endpoints, credentials, timeouts, or retries in `package.json`.
Consumer modules may expose `preferLocal`, timeout, and maximum-attempt policy;
changing transport must not change conversion meaning.

## Configuration Reference

| Property | Default | Operational meaning |
| --- | --- | --- |
| `units.maximumScale` | `18` | Highest permitted output decimal scale |
| `units.maximumConversionDigits` | `128` | Bounds exact numerator and denominator size |
| `units.referenceConversion.requireServiceToken` | `true` | Keeps remote conversion module-only |
| `units.referenceConversion.maximumDefinitionResults` | `20` | Fails closed when definition lookup is unexpectedly broad |
| `units.referenceConversion.multiHopEnabled` | `false` | Requires an explicit decision before graph conversion |
| `units.referenceConversion.maximumHops` | `4` | Bounds an enabled conversion path |
| `units.referenceConversion.maximumGraphConversions` | `200` | Bounds graph loading and traversal |
| `units.dimensions` | Common dimensions | Allow-list for supported dimension codes |
| `units.geographicScopeLevels` | Global through locality | Allow-list for regional specificity |
| `units.allowedTransitions` | Governed lifecycle map | Controls activation, suspension, and retirement |

Override policy in later project, environment, server, node, tenant, or
customer layers. Keep only static module metadata in `package.json`.

## Domain Integration Rules

- Inventory stores exact quantity strings and Unit codes; it owns balances,
  movements, reservations, and availability.
- Product stores Unit references for measured attributes, packaging,
  dimensions, and weight; it owns descriptive meaning.
- Pricing stores the Unit basis for a price; it owns monetary resolution.
- Land and agriculture modules retain the type and evidence of an area or
  yield; Units only normalizes the declared measurement.

Never snapshot the Units registry into a consumer, maintain a second conversion
table, or use JavaScript floating-point arithmetic for authoritative values.

## Security And Operations

Enterprise definitions resolve only within authenticated enterprise context,
with governed global fallback. Generated CRUD routers remain disabled. A
project that needs human master-data administration must add a narrowly
permissioned intent or governed import in a later module; it must not enable
generic generated CRUD as a shortcut.

Monitor conversion rejection by error code, dimension, selected geography,
and correlation identifier. Avoid logging sensitive business quantities or
parcel data. Back up Dimensions, Units, and Conversions together and restore
them in that order.

Capacity-test remote Units with representative conversion volume and latency.
High-volume consumers should normally co-host Units unless centralized remote
governance provides enough value to justify the network dependency.
