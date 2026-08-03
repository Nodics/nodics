# Extend Product Variant Policy

Use a later-loaded project module when a project needs another kind of
sellable variant. Extend the effective property instead of editing Product or
creating another variant registry.

```js
module.exports = {
    product: {
        variant: {
            variantItemTypes: ['SKU', 'ASSET', 'PROJECT_VARIANT']
        }
    }
};
```

If the project property loader replaces rather than merges arrays, repeat the
required defaults explicitly as shown. Keep the new Item type aligned with
`product.item.itemTypes` and `product.item.sellableTypes`.

Projects may also adjust `maximumAxesPerBase`, `maximumVariantsPerBase`, or
`maximumHierarchyDepth` after capacity testing. Do not remove finite bounds.
Do not copy Product Attributes, add a parallel combination store, expose
generated CRUD routers, or bypass Product validation.

Add project-layer tests proving the effective type policy, sellable Item rule,
required-axis coverage, semantic combination uniqueness, graph bounds,
enterprise isolation, and retirement behavior.
