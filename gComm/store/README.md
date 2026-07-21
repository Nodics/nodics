# Store

Store is the enterprise-scoped authority for physical, online, hybrid, dark, and pickup-point store identities. It also owns the governed association that says which Inventory warehouses may serve a store and for which purposes.

Implemented now:

- Store identity, classification, lifecycle, country, timezone, address reference, channels, and capabilities.
- Zero-to-many warehouse assignments per Store.
- Assignment purposes, priority, effective dates, and lifecycle.
- Authenticated enterprise isolation and deterministic internal identities.
- Inventory-owned warehouse validation and safe retirement rules.
- Consolidated local lookup and authenticated modular lookup through the Inventory-owned reference intent contract.
- Generated internal services with public routers deliberately disabled.

Not implemented in this slice: stock quantities, availability, reservations, sourcing decisions, store opening hours, POS operations, APIs, UI, address ownership, or product/pricing behavior.

Read [Store Foundation](docs/store-foundation.md) for the complete contract and [Managing Stores](../../gDocs/commerce/how-to-manage-stores.md) for the business workflow.

Focused verification:

```bash
node gComm/store/test/storeFoundationSchemaContract.test.js
node gComm/store/test/storeFoundationService.test.js
```
