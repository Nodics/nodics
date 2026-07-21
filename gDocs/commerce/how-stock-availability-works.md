# How Stock ON_HAND Availability Works

ON_HAND is the quantity currently recorded in Online Inventory for an item across eligible Warehouses. Inventory also reports active holds and computes `AVAILABLE_TO_SELL = ON_HAND - reservedQuantity`; this still does not promise a delivery date or fulfilment outcome.

Nodics first chooses Stock Pools using Sourcing Policies. It expands active Warehouse memberships, reads Stock Balances, converts compatible Units exactly, and returns a total with contributing Warehouse and Balance evidence.

Business configuration such as Pools and sourcing rules can follow staged approval and publishing. Operational quantities remain Online Inventory state; the cache is never authoritative. Applications call the Inventory API rather than reading NodeCache, Redis, or Hazelcast directly.

Availability responses may be cached for performance. Every cached response retains the contributing Balance revisions, which Inventory validates before returning a hit. Stock and sourcing changes invalidate the tenant cache across nodes. If a cache provider is unavailable, Inventory calculates from authoritative data instead. Administrators select one provider per channel in layered `properties.js`; business code never selects a provider.

If the result is zero, verify Online Pool/rule/member lifecycle, item identity, Warehouse balance, Unit compatibility, and effective dates. If the request fails, correct the dependency or configured boundary and retry; Nodics does not return a misleading partial total.

Read the [technical Availability contract](../../gComm/inventory/docs/stock-availability-foundation.md) for configuration, security, evidence, customization, deployment, and tests.

## Continue

- [How Stock Sourcing Works](how-stock-sourcing-works.md)
- [How Stock Movements Work](how-stock-movements-work.md)
