# Store Foundation Contract

- Resolve enterprise ownership from authenticated claims and fail closed when absent or conflicting.
- Derive primary identities from enterprise and business codes; never trust client-supplied internal identities.
- Store owns Store records, Warehouse assignments, and CMS Site bindings. Inventory owns Warehouse records; CMS owns Site/catalog/content records.
- Validate every assignment through the co-hosted Inventory service when available or the configured authenticated Inventory reference route when remote.
- Remote lookup uses the tenant-scoped internal token, enterprise header, bounded read request, and allow-listed Inventory projection.
- A Store may have no warehouse or many warehouses. An assignment identifies one Store/Warehouse pair and carries purposes and priority.
- A Store may have many Points of Service. A Point of Service is Store-owned operational endpoint metadata for pickup counters, lockers, service desks, storefront handoff points, dark-store counters, or third-party pickup points.
- Point of Service may reference an Inventory-owned Warehouse by `warehouseCode` and Fulfillment-owned shipping/pickup modes by `fulfillmentModeCodes`. Store must not copy stock, reservation, sourcing, carrier, or delivery-execution state.
- Point of Service may carry address reference, exact-string latitude/longitude, timezone, opening-hours metadata, pickup capacity mode, slot capacity, capacity provider reference, and external non-secret references. Address/geography/provider authorities remain outside Store.
- Identity fields are immutable. Lifecycle transitions come from `store/config/properties.js`.
- Project layers may extend Point of Service types, capacity modes, fulfillment mode allowlists, opening-hours metadata, and capacity-provider policy through configuration or service overrides while preserving Store ownership and referenced-authority boundaries.
- One Site binding contains a bounded unique Store list within one enterprise; a CMS Site has one Store-owned binding authority.
- Validate CMS Sites locally or through the CMS service-token reference intent. Never copy CMS state.
- Retire assignments and Site bindings before retiring their Store. Never hard-delete foundation records.
- Generated schema routers remain disabled. Human management intents require access tokens and explicit read/manage permissions; Store/CMS reference intents require service tokens.
- Pricing validates `STORE` scopes through the Store-owned configured provider in both co-hosted and modular topologies.
- Later modules may extend configuration or replace services but must preserve isolation, ownership, and historical-reference invariants.
