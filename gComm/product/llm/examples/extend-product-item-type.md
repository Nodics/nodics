# Extend a Product Item Type

A project can add an item type in its later-loaded `properties.js` contribution:

```javascript
module.exports = {
    product: {
        item: {
            itemTypes: ['PROJECT_ITEM'],
            sellableTypes: ['PROJECT_ITEM']
        }
    }
};
```

Use the repository's effective property merge semantics so the project adds to
the intended arrays instead of accidentally removing required defaults. Add a
project-owned schema extension only when the new type needs persistent fields,
and override `DefaultProductFoundationService` only when validation cannot be
expressed through existing policy or schema constraints.

Do not copy Product services, create another item registry, or move Catalog,
Units, Pricing, or Inventory truth into the project Product record. Add a
project-layer test proving the effective type, validation, API projection, and
generated schema behavior.
