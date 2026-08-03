# Extend Product Classification

A project can add an allowed external reference classification through its
later-loaded `properties.js` contribution:

```javascript
module.exports = {
    product: {
        attribute: {
            referenceTypes: ['SUPPLIER_ASSET']
        }
    }
};
```

Add a later-layer schema extension only when the reference needs additional
persisted metadata. Override the smallest method in
`DefaultProductClassificationService` or a configured reference provider when
the new reference type needs authoritative validation.

Do not add executable validation scripts to Attribute Definitions, store
floating-point commercial/measurement values, copy Unit conversion behavior,
or create another classification registry. Add project-owned positive,
negative, boundary, generated-schema, and override tests.
