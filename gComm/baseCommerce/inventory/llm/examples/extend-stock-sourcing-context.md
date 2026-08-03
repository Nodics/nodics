# Extend Stock Sourcing Context

Layer configuration in a later project module instead of editing Inventory:

```js
module.exports = {
    inventory: {
        stockSourcing: {
            contextKeys: ['countryCode', 'zoneCode', 'storeCode', 'channelCode',
                'customerSegmentCode', 'fulfillmentType', 'itemType', 'itemCode', 'projectQualifier']
        }
    }
};
```

Keep values declarative. Do not add scripts or database query operators.
