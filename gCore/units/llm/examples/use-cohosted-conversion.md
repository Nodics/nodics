# Use Co-hosted Units Conversion

Activate `units` in the consuming runtime and call the consumer's configured
Units provider. The provider may delegate locally to
`DefaultUnitsReferenceService.convertInternal` with canonical string input:

```json
{
  "quantity": "2500",
  "fromUnitCode": "G",
  "toUnitCode": "KG",
  "targetScale": 3,
  "roundingMode": "UNNECESSARY"
}
```

Prefer this topology for latency-sensitive Inventory, Product, and Pricing
compositions. Do not invoke generated persistence services from the consuming
domain, copy Unit definitions, or create a second conversion implementation.
Co-hosting changes transport, not Units ownership.
