# How Stock ON_HAND Availability Works

ON_HAND is the quantity currently recorded in Online Inventory for an item across eligible Warehouses. Inventory also reports active holds and computes `AVAILABLE_TO_SELL = ON_HAND - reservedQuantity`; this still does not promise a delivery date or fulfilment outcome.

Nodics first chooses Stock Pools using Sourcing Policies. It expands active Warehouse memberships, reads Stock Balances, converts compatible Units exactly, and returns a total with contributing Warehouse and Balance evidence.

Business configuration such as Pools and sourcing rules can follow staged approval and publishing. Operational quantities remain Online Inventory state; the cache is never authoritative. Applications call the Inventory API rather than reading NodeCache, Redis, or Hazelcast directly.

Availability responses may be cached for performance. Every cached response retains the contributing Balance revisions, which Inventory validates before returning a hit. Stock and sourcing changes invalidate the tenant cache across nodes. If a cache provider is unavailable, Inventory calculates from authoritative data instead. Administrators select one provider per channel in layered `properties.js`; business code never selects a provider.

If the result is zero, verify Online Pool/rule/member lifecycle, item identity, Warehouse balance, Unit compatibility, and effective dates. If the request fails, correct the dependency or configured boundary and retry; Nodics does not return a misleading partial total.

## Checking stock from a website

Suppose Apparel and Electronics are two websites belonging to the same enterprise and tenant. Storefront resolves each hostname to its own Store, country, and channel. The application sends the returned opaque handle to Inventory:

```http
POST /nodics/inventory/v0/delivery/storefront/stock-availability/evaluate HTTP/1.1
Content-Type: application/json
x-nodics-storefront-context: <opaque handle from Storefront>

{
  "item": {
    "itemType": "SKU",
    "itemCode": "IPHONE-17-PRO",
    "unitCode": "piece"
  }
}
```

Inventory verifies the handle for its own audience and derives the correct tenant, enterprise, Store, country, and channel. The browser cannot select another website's sourcing rules by submitting its own context. The result returns ON_HAND, reserved, and AVAILABLE_TO_SELL totals but hides internal Pools, Warehouses, Balance records, revisions, and enterprise identity.

An expired or unverifiable handle is denied. Resolve the hostname again and retry with a fresh handle; do not add tenant, enterprise, Store, or sourcing information to the browser payload. Trusted services that require operational evidence use the separate service-token-only reference intent.

Operators configure Storefront introspection under `inventory.storefrontContext` in layered `properties.js`. Multi-node Storefront deployments require a shared security-state cache so any node can introspect a recently issued handle. Inventory Availability cache failure remains fail-open to authoritative Stock calculation, but Storefront security-state failure remains fail-closed.

Read the [technical Availability contract](../../gComm/inventory/docs/stock-availability-foundation.md) for configuration, security, evidence, customization, deployment, and tests.

## Continue

- [How Stock Sourcing Works](how-stock-sourcing-works.md)
- [How Stock Movements Work](how-stock-movements-work.md)
