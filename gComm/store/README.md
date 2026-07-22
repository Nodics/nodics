# Store

Store is the enterprise-scoped authority for physical, online, hybrid, dark, and pickup-point Store identities. It owns governed Store-to-Warehouse assignments while Inventory remains the Warehouse authority. Storefront owns website composition and references Store through its service contract.

Implemented now:

- Store identity, classification, lifecycle, country, timezone, address reference, channels, and capabilities.
- Zero-to-many warehouse assignments per Store.
- Assignment purposes, priority, effective dates, and lifecycle.
- Authenticated enterprise isolation and deterministic internal identities.
- Inventory-owned warehouse validation and safe retirement rules.
- Consolidated local lookup and authenticated modular lookup through the Inventory-owned reference intent contract.
- Bounded access-token management intents for Stores and Warehouse assignments.
- A service-token-only Store reference intent used by Pricing and other modules.
- Generated schema routers remain private; approved intent routes are explicit and permission-controlled.

Not implemented in this slice: BackOffice frontend screens, storefront rendering, stock quantities, availability, reservations, sourcing decisions, store opening hours, POS operations, address ownership, or product behavior. Pricing already validates Store-scoped assignments through the Store-owned reference contract.

Read [Store Foundation](docs/store-foundation.md), [Store, Site, and Integration](docs/store-site-and-integration.md), the [Store and website modeling guide](../../gDocs/commerce/how-to-model-stores-and-websites.md), and the [business guide](../../gDocs/commerce/how-to-manage-stores.md).

Focused verification:

```bash
node gComm/store/test/storeFoundationSchemaContract.test.js
node gComm/store/test/storeFoundationService.test.js
node gComm/store/test/storeManagementContract.test.js
```
