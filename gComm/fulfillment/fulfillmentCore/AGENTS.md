# Fulfillment Core Agent Contract

Follow the root Nodics contract: `../../../AGENTS.md`.
Follow the commerce group contract: `../../AGENTS.md`.
Follow the fulfillment family contract: `../AGENTS.md`.
Follow global AI/development guidance: `../../../gSetup/llm/README.md`.

## Ownership

- Fulfillment owns consignment, shipment, carrier, delivery-release, and future return-pickup evidence.
- Order owns order header, entries, delivery groups, payment groups, and order history.
- Inventory owns stock, reservations, allocations, movements, warehouse counters, and fulfillment reconciliation.
- Payment owns payment authorization, capture, refund, void, and transaction evidence.

## Rules

- Do not put shipment/consignment lifecycle into Order services.
- Do not mutate Inventory counters directly. Fulfillment must call Inventory-owned intents/services when stock movement or allocation reconciliation is required.
- Do not store carrier credentials, labels, raw provider payloads, internal warehouse paths, or customer secrets in Fulfillment schemas.
- Keep fulfillment behavior configuration-first through `fulfillment.fulfillmentPolicy` and replaceable services.
- Customer modules must be able to replace grouping, carrier selection, release, shipment confirmation, and return-pickup behavior without modifying OOTB framework code.
