# Store Agent Contract

Follow the root Nodics contract and `gComm/AGENTS.md`.

- Store owns retail/digital Store identity, Store-to-Warehouse assignment policy, and Store-to-CMS-Site binding policy. Inventory owns Warehouses; CMS owns Sites, catalogs, pages, templates, components, and content.
- Every record is tenant- and authenticated-enterprise scoped. Never accept enterprise ownership from an untrusted payload.
- `code` is derived. Business users supply `storeCode` and, for assignments, `warehouseCode`.
- Store and assignment identities are immutable; retire records instead of hard-deleting them.
- Validate Warehouse references through Inventory and Site references through CMS. Do not copy owning-module state or create parallel registries.
- Keep stock, availability, reservation, sourcing, pricing, product, address, geography, and channel authorities outside Store.
- Keep generated schema routers disabled. Human management intents use access tokens plus Store permissions; module references use service tokens only.
- Preserve one Store-owned binding per CMS Site, bounded unique Store lists, immutable identities, and dependency-safe retirement.
- Every implemented slice requires low-level business, operator, developer, customization, recovery, and verification documentation.
