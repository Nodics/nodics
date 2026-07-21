# Extend A Warehouse Classification

In a later project module, layer the property rather than editing inventory:

```js
module.exports = {
    inventory: {
        warehouse: {
            types: ['PHYSICAL', 'VIRTUAL', 'STORE', 'MICRO_FULFILLMENT']
        }
    }
};
```

Add a project-owned effective-contract test proving the merged policy accepts
`MICRO_FULFILLMENT` and rejects an unknown type. Preserve persisted OOTB
classifications or provide a migration. Do not copy the schema, create a
parallel validator, or hand-edit generated context.
