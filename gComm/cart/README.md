# cart Module

`cart` owns shopping-cart capability behavior in the commerce layer. It provides the module space for cart schemas, routes, controllers, facades, services, pipelines, interceptors, utilities, and tests.

Use this module for cart-specific behavior such as basket state, item operations, cart validation, and cart workflow integration. Order lifecycle behavior belongs in `gComm/order`.

Cart rules should be configurable and tenant-aware. Do not hardcode customer-specific pricing, promotion, or checkout assumptions into this module.

## Cart entries

`cartEntry` is the cart-owned line-entry model. It references its parent through
`cartCode` instead of storing a mutable `entries` array on the cart parent. This
keeps large carts from rewriting the parent record for every line change and
lets Axis render entries through backend-provided Workbench detail panels.

Line quantities and money snapshots are exact decimal strings. Product,
Catalog, Units, Pricing, Tax, Promotion, Inventory, and Media remain
authoritative for their own business rules; cart entries only keep the cart line
state and evidence required by checkout.

Customer projects should extend `cartEntry` through later schema layers and
additional validators/interceptors instead of modifying this framework source.

`DefaultCartEntryPolicyService` and the shared `checkoutEntryPolicy` utility
protect the reusable entry contract. The policy validates required identity
fields, positive exact decimal-string quantities, non-negative exact monetary
evidence, parent `cartCode`, allowed statuses, immutable fields, and configured
lifecycle transitions. Projects customize these rules through layered
`cart.checkoutEntry.policy` configuration or by replacing the service, while Product,
Pricing, Units, Tax, Promotion, Inventory, Payment, and Fulfillment remain
authoritative for their own rules.
