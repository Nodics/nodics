# cart Module

`cart` owns shopping-cart capability behavior in the commerce layer. It provides the module space for cart schemas, routes, controllers, facades, services, pipelines, interceptors, utilities, and tests.

Use this module for cart-specific behavior such as basket state, item operations, cart validation, and cart workflow integration. Order lifecycle behavior belongs in `gComm/checkout/order`.

Cart rules should be configurable and tenant-aware. Do not hardcode customer-specific pricing, promotion, or checkout assumptions into this module.

Read the group-level
[Commerce Checkout Foundation](../../llm/contracts/commerce-checkout-foundation-contract.md)
for the beginner model, schema relationships, lifecycle, and customer-module
customization pattern before changing Cart checkout behavior.

## Cart calculation pipelines

Cart calculation is a pipeline contract, not one large Cart service. The module
contributes three related pipelines:

- `cartValidationPipeline` validates the cart header, entries, allocations,
  inventory readiness, and money evidence in small replaceable nodes.
- `cartEntryCalculationPipeline` calculates one cart entry by delegating product
  context, base price, promotion, tax, and inventory promise decisions to the
  owning modules.
- `cartCalculationPipeline` orchestrates the aggregate task. It runs cart
  validation, triggers entry calculation, then prepares delivery-charge,
  cart-promotion, cart-tax, payment-plan, and final-total evidence.

The backend runtime entry point is `DefaultCartService.calculateCart`, exposed
through the secured `POST /nodics/cart/code/:code/calculate` route. The route
accepts optional preloaded cart aggregate data for orchestration/testing, but
Cart remains the owner of invoking the calculation pipeline. Axis or other
clients must not coordinate entry, price, tax, inventory, payment, or
fulfillment calculations through separate browser-side calls.

This shape is mandatory. Customer modules may add, replace, or reorder nodes,
but they should not collapse calculation into a monolithic service or duplicate
Pricing, Promotion, Tax, Inventory, Payment, or Fulfillment authority inside
Cart.

The default entry pipeline nodes use the shared
`gComm/checkout/checkoutCore/src/utils/commerceCalculationDelegateUtils` adapter helper. Each
node reads `cart.calculation.delegates` and calls the configured owning service
only when that adapter exists. For example, `resolveBasePrice` delegates to
`DefaultPriceResolutionService.resolve`, while tax and promotion nodes record
deferred evidence until a Tax or Promotion evaluator service is provided by the
owning module or a customer layer. This is deliberate: Cart can orchestrate the
checkout calculation task, but it must not invent price, tax, discount, or
stock rules itself.

For a beginner, think of Cart as the checkout worksheet. It asks Product "what
is this item?", asks Pricing "what price applies?", asks Promotion "what
discount applies?", asks Tax "what tax evidence applies?", and asks Inventory
"can this quantity be promised?". If one of those owning calculators has not
yet been installed, the default pipeline records `DEFERRED` evidence instead
of pretending to calculate the answer. A customer project adds a real adapter
by layering `cart.calculation.delegates.<step>` configuration to point at its
own service, or by replacing only that one pipeline node.

## Cart entries

`cartEntry` is the cart-owned line-entry model. It references its parent through
`cartCode` instead of storing a mutable `entries` array on the cart parent. This
keeps large carts from rewriting the parent record for every line change and
lets Axis render entries through backend-provided Workbench detail panels.

Line quantities and money snapshots are exact decimal strings. Product,
Catalog, Units, Pricing, Tax, Promotion, Inventory, and Media remain
authoritative for their own business rules; cart entries only keep the cart line
state and evidence required by checkout.

Cart entries also keep the customer-facing tax display evidence that was
accepted during checkout. For tax-exclusive prices, `lineNetAmount` usually
matches the pre-tax line amount and `lineGrossAmount` includes added tax. For
tax-inclusive prices, `lineGrossAmount` is the amount shown to the shopper while
`lineNetAmount`, `taxTotal`, `taxInclusionMode`, `taxIncluded`,
`taxQuoteCode`, and `taxQuoteLineCode` explain exactly how much tax was inside
that displayed price. Cart does not calculate this split; Pricing and Tax
produce the evidence and Cart persists it so business users, customers, and
later order conversion can see what was applied.

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

## Checkout delivery and payment allocations

Cart checkout uses allocation-first modeling for distributed delivery and
distributed payment. A `cartEntry` states what the user wants to buy; delivery
and payment allocation records state how parts of that entry quantity are
delivered, paid, reserved, or later fulfilled.

The cart-owned models are:

- `cartDeliveryGroup` for one delivery destination or delivery context such as
  address, pickup, digital, or service delivery.
- `cartDeliveryAllocation` for the exact entry quantity assigned to one
  delivery group.
- `cartPaymentGroup` for one payment mode or payment authority context.
- `cartPaymentAllocation` for the exact entry quantity and amount assigned to
  one payment group.

This supports enterprise checkout cases such as one cart entry with quantity
`3` where quantity `2` ships to one address, quantity `1` ships to another
address, and each quantity portion is funded by a different payment group.
Allocations also carry optional `serialNumbers`, `inventoryReservationCode`,
and `inventoryAllocationCode` so later inventory work can move from quantity
allocation to unit, serial, or batch-level evidence without redesigning cart.

Cart does not calculate shipping, payment authorization, stock reservation,
tax, promotion, or final fulfillment. Those authorities belong to their
owning modules. Cart records the checkout allocation state and evidence codes
that those authorities can consume or enrich. Projects customize validation
through layered `cart.checkoutAllocation.policy` configuration or by replacing
`DefaultCartCheckoutAllocationPolicyService`.
