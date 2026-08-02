# gComm

`gComm` is the commerce group module. It composes commerce capabilities such as cart and order and provides the shared configuration layer for commerce-oriented project modules.

Use this group for composition and shared commerce defaults. Capability behavior belongs in child modules such as `cart`, `order`, `store`, `inventory`, `pricing`, `payment`, `fulfillment`, and `product`.

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

Pricing provides reusable scoped Price Lists, Price Groups, exact Price records,
deterministic Online resolution, and Workflow/nPublish-controlled Staged-to-Online
release. See [Pricing](pricing/README.md).

Product provides enterprise-scoped Product Item and alternate-Identifier
identity, governed lifecycle, Catalog and Unit reference validation, human
management intents, and service-token lookup. See [Product](product/README.md).

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
