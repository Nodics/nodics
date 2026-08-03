# Fulfillment Core LLM Notes

Use these notes when extending the `gComm/fulfillment/fulfillmentCore` capability.

- Fulfillment owns consignment and shipment evidence.
- Order owns order delivery split evidence and delegates release.
- Inventory owns stock counters and fulfillment reconciliation.
- Keep provider credentials and raw carrier payloads out of schemas and config.
- Prefer configuration and service overrides over framework edits.
