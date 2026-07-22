# Use Modular Units Conversion

When another module needs conversion, prefer its local/remote provider and keep
Units as the authority. The remote request is:

```text
POST /nodics/units/v0/references/units/convert
Authorization: Bearer <runtime service token>
x-enterprise-code: <authenticated enterprise>
```

```json
{
  "quantity": "1000",
  "fromUnitCode": "G",
  "toUnitCode": "KG",
  "targetScale": 3,
  "roundingMode": "UNNECESSARY"
}
```

Configure module name, API path, timeout, attempts, and local preference through
the consuming module's `properties.js`. Do not copy Unit definitions, invoke
generated Units CRUD remotely, accept JavaScript numbers, or implement a
second conversion table in the consuming module.

Use remote deployment only when independently deployed consumers require a
central authority. A module does not need its own server merely because Nodics
can deploy it independently. For ordinary latency-sensitive compositions,
prefer the co-hosted provider path.
