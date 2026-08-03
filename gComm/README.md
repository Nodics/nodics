# gComm

`gComm` is the commerce group module. It composes commerce capability families
and provides the shared configuration layer for commerce-oriented project
modules.

Use this group for composition and shared commerce defaults. Runtime capability
behavior belongs in child modules and child groups:

- `baseCommerce` owns foundational commerce grouping for `product`, `store`,
  `pricing`, `promotion`, `tax`, and `inventory`.
- `checkout` owns the Checkout family grouping for `cart`, `checkoutCore`, and
  `order`.
- `payment` owns the Payment family grouping for core payment, methods, and
  providers.
- `fulfillment` owns shipment, consignment, delivery-release, tracking, and
  return-pickup evidence.

Do not put product, price, tax, promotion, stock, shipment, payment,
cancellation, return, or refund business logic directly in `gComm`.

Checkout is documented as an allocation-first commerce journey in
[Commerce Checkout Foundation](llm/contracts/commerce-checkout-foundation-contract.md).
Checkout placement must use the existing Workflow and nPipeline capabilities:
Workflow carries multi-task business lifecycle, manual approvals, recovery, and
action/channel routing. nPipeline is used only inside a single technical task
when that task must be split into ordered internal steps.
Read it before changing cart, order, delivery, payment, inventory promise,
fulfillment, return, refund, or promotion behavior. It explains the beginner
model, schema relationships, current implementation, and customer-module
customization rules.

The `checkout/checkoutCore` child module owns shared checkout orchestration helpers such as
`checkout/checkoutCore/src/utils/commerceCalculationDelegateUtils`. Cart and Order use that
helper to delegate to Product, Pricing, Promotion, Tax, Inventory, Payment, and
Fulfillment adapters without duplicating those modules' authority. The helper
records explicit delegated or deferred evidence; it must not become a new
calculation engine.

Pricing provides reusable scoped Price Lists, Price Groups, exact Price records,
deterministic Online resolution, and Workflow/nPublish-controlled Staged-to-Online
release. See [Pricing](baseCommerce/pricing/README.md).

Product provides enterprise-scoped Product Item and alternate-Identifier
identity, governed lifecycle, Catalog and Unit reference validation, human
management intents, and service-token lookup. See
[Product](baseCommerce/product/README.md).

Store, Promotion, Tax, and Inventory also live under
[Base Commerce](baseCommerce/README.md) because they are shared foundations
used by checkout, order lifecycle, storefront, Axis, cancellation, return, and
refund capabilities.

Payment provides payment-provider metadata, safe payment-transaction evidence,
exact-money policy, checkout payment authorization boundaries, and refund
transaction evidence. Order delegates payment actions to Payment during
checkout placement and reverse-flow workflows; it does not own gateway logic.
See [Payment](payment/README.md).

Fulfillment provides consignment, shipment, tracking, warehouse task, and return
request evidence for order delivery execution. Order delegates delivery release
to Fulfillment during checkout placement; Fulfillment delegates stock
movement/reconciliation to Inventory when needed and leaves refund transaction
evidence to Payment. See [Fulfillment](fulfillment/README.md).

Commerce extensions should keep framework contracts intact: schemas, routers, services, pipelines, access control, validation, audit, and tests remain the source of behavior.
