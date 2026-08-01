# order Module

`order` owns order capability behavior in the commerce layer. It provides the module space for order data, schemas, routes, services, pipelines, interceptors, utilities, and tests.

Use this module for order-specific lifecycle behavior after cart conversion, including order creation, validation, state handling, and integration events. Cart behavior remains in `gComm/cart`.

Order extensions must preserve auditability, tenant context, access control, rollback safety, and generated artifacts from source definitions.

## Order entries

`orderEntry` is the order-owned line-entry model. It references its parent
through `orderCode` instead of storing a mutable `entries` array on the order
parent. Order entries preserve checkout evidence after cart conversion: product
identity, quantity, unit, currency, price, tax, discount, and optional inventory
reservation/allocation references.

Order entries do not calculate pricing, tax, promotion, stock, fulfillment, or
payment state. Those authorities stay in their owning modules and may attach
evidence codes to the entry. Customer projects can extend `orderEntry` through
later schema layers and stricter lifecycle services while keeping this
framework contract stable.

`DefaultOrderEntryPolicyService` reuses the Cart-owned `checkoutEntryPolicy`
utility because Cart contributes `abstractCartEntry`. It validates immutable
order-entry evidence and builds order-entry payloads from cart entries through
`order.checkoutEntry.policy` conversion field mappings. This is only the checkout-entry contract:
pricing, tax, promotion, inventory allocation, payment, and fulfillment remain
separate authorities and can attach evidence codes without being copied into
Order.
