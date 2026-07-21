# Store Agent Contract

Follow the root Nodics contract and `gComm/AGENTS.md`.

- Store owns retail/digital store identity and Store-to-Warehouse assignment policy; Inventory owns warehouses.
- Every record is tenant- and authenticated-enterprise scoped. Never accept enterprise ownership from an untrusted payload.
- `code` is derived. Business users supply `storeCode` and, for assignments, `warehouseCode`.
- Store and assignment identities are immutable; retire records instead of hard-deleting them.
- Validate warehouse references through Inventory. Do not copy warehouse state into Store or create another warehouse registry.
- Keep stock, availability, reservation, sourcing, pricing, product, address, geography, and channel authorities outside Store.
- Keep public generated routers disabled until intent APIs, permissions, and security tests are approved.
- Every implemented slice requires low-level business, operator, developer, customization, recovery, and verification documentation.
