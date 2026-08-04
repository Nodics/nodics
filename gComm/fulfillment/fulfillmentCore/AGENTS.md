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
- Returned-goods receipt and inspection run through `returnReceiptDispositionPipeline`. Fulfillment persists receipt/inspection/disposition; Inventory alone applies stock movement, and Fulfillment closes only with normalized Inventory evidence.
- Do not mutate Inventory counters directly. Fulfillment must call Inventory-owned intents/services when stock movement or allocation reconciliation is required.
- Do not store carrier credentials, labels, raw provider payloads, internal warehouse paths, or customer secrets in Fulfillment schemas.
- Keep fulfillment behavior configuration-first through `fulfillment.fulfillmentPolicy` and replaceable services.
- Customer modules must be able to replace grouping, carrier selection, release, shipment confirmation, and return-pickup behavior without modifying OOTB framework code.
- Apply order cancellation to consignments only through the Fulfillment-owned internal intent; Order and Workflow must not mutate consignment persistence directly.
- Preserve exact allocation quantities and serial evidence. Reject over-cancellation, repeated serial cancellation, shipped consignments, and stale revisions.
- Persist private, replay-safe checkpoints for multi-consignment cancellation and expose reconciliation-required failures instead of guessing whether a partial mutation completed.
- Keep Inventory release and Payment void/refund as independent owner operations coordinated by Workflow; Fulfillment cancellation must not mutate their records.
