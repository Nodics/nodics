# Extend A Stock Pool Type

Add a project-specific type through a later module's layered configuration:

```js
module.exports = {
    inventory: {
        stockPool: {
            types: ['GENERAL', 'FULFILLMENT', 'PICKUP', 'REPLENISHMENT', 'RETURNS', 'COLD_CHAIN']
        }
    }
};
```

Use the effective inherited list required by the project configuration layer.
Do not copy Pool services, create a second Pool registry, store quantities in a
Pool, or embed sourcing expressions in Pool records.
