# Store

Store is the enterprise-scoped authority for physical, online, hybrid, dark, and pickup-point Store identities. It owns governed Store-to-Warehouse assignments while Inventory remains the Warehouse authority. Storefront owns website composition and references Store through its service contract.

Implemented now:

- Store identity, classification, lifecycle, country, timezone, address reference, channels, and capabilities.
- Zero-to-many warehouse assignments per Store.
- Assignment purposes, priority, effective dates, and lifecycle.
- Point of Service records for pickup counters, lockers, service desks, storefront handoff points, dark-store counters, and third-party pickup points.
- Point of Service policy for address reference, exact-string geolocation, opening-hours metadata, pickup capacity mode, optional pickup slot capacity, optional Inventory warehouse reference, and supported Fulfillment mode codes.
- Authenticated enterprise isolation and deterministic internal identities.
- Inventory-owned warehouse validation and safe retirement rules.
- Consolidated local lookup and authenticated modular lookup through the Inventory-owned reference intent contract.
- Bounded access-token management intents for Stores and Warehouse assignments.
- A service-token-only Store reference intent used by Pricing and other modules.
- Generated schema routers remain private; approved intent routes are explicit and permission-controlled.

Not implemented in this slice: BackOffice frontend screens, storefront rendering, stock quantities, availability, reservations, sourcing decisions, executable opening-hour calendars, address ownership, or product behavior. Pricing already validates Store-scoped assignments through the Store-owned reference contract.

## Point of Service model

A Store is the commercial/business location or channel. A Point of Service is the operational place where a customer or operator can interact with that Store: pickup desk, locker bank, service desk, dark-store pickup door, local collection counter, or third-party pickup point.

Store owns the POS identity and policy because business users need to decide which points are active, what they are called, which Store they belong to, whether they support pickup/local delivery, and what pickup capacity policy is shown to checkout. Store does not own stock, reservations, delivery execution, or addresses:

- Inventory owns `warehouse` and all stock/availability/reservation behavior.
- Fulfillment owns `fulfillmentMode` and carrier/provider execution.
- Profile or a future address provider owns address records.
- Geography/map providers remain external; POS stores latitude/longitude only as exact display/filter strings.

Customer modules can extend `store.pointOfService.types`, `pickupCapacityModes`, supported `fulfillmentModeCodes`, opening-hours metadata, or capacity-provider references through layered configuration without changing Store source.

Read Store Foundation (canonical documentation: `capability.commerce.technical-reference`), Store, Site, and Integration (canonical documentation: `capability.commerce.technical-reference`), the [Store and website modeling guide](https://github.com/Nodics/nodicsdocs), and the [business guide](https://github.com/Nodics/nodicsdocs).

Focused verification:

```bash
node gComm/store/test/storeFoundationSchemaContract.test.js
node gComm/store/test/storeFoundationService.test.js
node gComm/store/test/storeManagementContract.test.js
```
