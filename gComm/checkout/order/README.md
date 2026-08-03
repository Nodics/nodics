# order Module

`order` owns order capability behavior in the commerce layer. It provides the module space for order data, schemas, routes, services, pipelines, interceptors, utilities, and tests.

Use this module for order-specific lifecycle behavior after cart conversion, including order creation, validation, state handling, and integration events. Cart behavior remains in `gComm/checkout/cart`.

Order extensions must preserve auditability, tenant context, access control, rollback safety, and generated artifacts from source definitions.

Read the group-level
[Commerce Checkout Foundation](../../llm/contracts/commerce-checkout-foundation-contract.md)
for the beginner model, schema relationships, cart-to-order lifecycle, and
customer-module customization pattern before changing Order checkout behavior.

## Order calculation pipelines

Order calculation is a pipeline contract and a historical-evidence operation.
The module contributes three related pipelines:

- `orderValidationPipeline` validates the order header, entries, allocations,
  payment evidence, and historical checkout evidence in small replaceable
  nodes.
- `orderEntryCalculationPipeline` recalculates or reconciles one order entry
  only when an explicit order lifecycle operation requires it.
- `orderCalculationPipeline` orchestrates the aggregate task. It runs order
  validation, triggers order-entry calculation, then reconciles delivery,
  promotion, tax, payment, and final order totals from accepted evidence.

The backend runtime entry point is `DefaultOrderService.calculateOrder`,
exposed through the secured `POST /nodics/order/code/:code/calculate` route.
Because orders preserve historical checkout evidence, the route requires an
explicit `lifecycleOperation` such as `AMENDMENT`, `RETURN`, `REFUND`,
`ADJUSTMENT`, or `RECONCILIATION`. Axis or other clients may request a governed
reconciliation, but they must not recalculate order money, tax, inventory,
payment, or fulfillment evidence in the browser.

Checkout placement and reverse processing remain Workflow-owned business
processes. Order calculation pipelines divide one technical calculation or
reconciliation task; they must not replace Workflow or hide Payment, Inventory,
Fulfillment, Promotion, Pricing, or Tax side effects inside Order.

The default order-entry pipeline uses the same shared
`gComm/checkout/checkoutCore/src/utils/commerceCalculationDelegateUtils` helper as Cart. Each
reconciliation node reads `order.calculation.delegates` and calls a configured
owning adapter only when it is available. If a delegate is not installed, the
node records `DEFERRED` evidence. If an installed delegate fails, the pipeline
fails instead of hiding an uncertain order recalculation result.

For a beginner, Order calculation is not "re-run checkout whenever someone
opens the order." It is a governed reconciliation action. Order keeps what was
accepted at checkout, then, only during an explicit lifecycle operation such as
an amendment, return, refund, adjustment, or reconciliation, it asks Pricing,
Promotion, Tax, Inventory, Payment, and Fulfillment for new or verified
evidence. Customer modules customize this by changing delegate configuration or
replacing one node, not by copying a whole order-calculation service.

## Order entries

`orderEntry` is the order-owned line-entry model. It references its parent
through `orderCode` instead of storing a mutable `entries` array on the order
parent. Order entries preserve checkout evidence after cart conversion: product
identity, quantity, unit, currency, price, tax, discount, and optional inventory
reservation/allocation references.

The copied tax evidence is intentionally explicit. Even when the original price
was tax-inclusive, Order stores `lineNetAmount`, `lineGrossAmount`, `taxTotal`,
`taxInclusionMode`, `taxIncluded`, tax quote references, jurisdiction, category,
and rate evidence. This lets invoices, support screens, emails, exports, and
audits show the applied tax without recalculating historical prices or asking
Pricing/Tax to guess what was shown to the customer at checkout time.

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

## Order history

`orderHistoryEntry` is the order-owned lifecycle evidence model. It references
the parent order through `orderCode` and records event type, status transition
evidence, actor identity, reason code, source module/operation, evidence code,
and a safe human-readable message. It does not replace global audit, workflow,
payment, inventory, or fulfillment records; it provides an order-centered
support timeline that Axis can render as a related detail panel.

## Checkout placement workflow

Checkout placement is intentionally not one large imperative service. Order
owns the durable placement evidence, but the business lifecycle must run
through the existing Nodics Workflow capability. nPipeline is used only inside
one technical task when that task needs smaller deterministic steps, such as
starting placement-run evidence.

The default Order contribution is:

- Workflow heads:
  - `checkoutPlacementAutomaticFlow`
  - `checkoutPlacementManualFlow`
- Workflow actions:
  - `checkoutPlacementStartRunAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.startPlacementRun`
  - `checkoutPlacementValidateAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.validatePlacement`
  - `checkoutPlacementReserveInventoryAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.reserveInventory`
  - `checkoutPlacementCreateOrderAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.createOrderProjection`
  - `checkoutPlacementCopyAllocationsAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.copyAllocations`
  - `checkoutPlacementAuthorizePaymentAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.authorizePayment`
  - `checkoutPlacementReleaseFulfillmentAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.releaseFulfillment`
  - `checkoutPlacementRecordHistoryAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.recordHistory`
  - `checkoutPlacementCompleteAction`, handled by
    `DefaultCheckoutPlacementWorkflowService.completePlacement`
- Atomic pipeline:
  - `checkoutPlacementRunPipeline`, handled by
    `DefaultCheckoutPlacementPipelineService`
- Evidence model:
  - `checkoutPlacementRun`

Workflow owns carrier state, manual review, retries, recovery, and action
routing across the checkout business process. The placement-run pipeline owns
only the ordered internal steps for one technical task: validating run context,
starting run evidence, and formatting final run evidence.

`DefaultOrderCheckoutPlacementValidationService` backs the
`validatePlacement` Workflow action. It validates the cart header, enterprise
scope, checkout-ready status, entry presence, delivery/payment group models,
allocation references, and exact quantity totals for distributed delivery and
payment splits before Inventory reservation is attempted.

`DefaultCheckoutInventoryReservationService` backs the `reserveInventory`
Workflow action. It converts configured checkout delivery allocations into
Inventory Promise Reservation requests and delegates all promise capacity,
overbooking, counter revision, and commercial payment requirement decisions to
Inventory-owned orchestration.

`DefaultCheckoutOrderProjectionService` backs the `createOrderProjection`
Workflow action. It creates an idempotent Order header and Order Entries from
validated Cart evidence through generated Order services and the existing Order
Entry policy builder. The projection preserves source cart, workflow carrier,
placement, and entry traceability, but it does not own payment capture,
fulfillment, or Inventory counters.

`DefaultCheckoutAllocationCopyService` backs the `copyAllocations` Workflow
action. It copies Cart delivery groups, payment groups, delivery allocations,
and payment allocations into Order-owned models through generated Order
services and the existing Order checkout allocation policy builders. It does
not recalculate quantities, amounts, or inventory evidence; it freezes the
checkout split evidence and retains source cart group/allocation codes for
audit and support.

Accepted delivery charges follow the same evidence rule. Pricing owns the
`deliveryChargeQuote`; Cart delivery groups carry the accepted quote code,
exact delivery charge amount, currency, and tax mode as checkout state; Order
copies those fields onto `orderDeliveryGroup` during placement so the
customer-facing delivery charge is immutable order evidence. Fulfillment and
carrier adapters may later record operational shipping cost or invoice
reconciliation, but that does not change the commercial delivery charge that
was accepted at checkout.

`DefaultCheckoutPlacementWorkflowService.authorizePayment` backs the
`checkoutPlacementAuthorizePaymentAction`. It does not authorize payment
itself. It resolves the produced order and copied payment groups, then
delegates authorization/deferred handling to
`DefaultPaymentCheckoutAuthorizationService` in the Payment module. Order only
receives safe transaction evidence and counts for history, completion, and
operator support.

`DefaultCheckoutPlacementWorkflowService.releaseFulfillment` backs the
`checkoutPlacementReleaseFulfillmentAction`. It does not create shipments
inside Order. It resolves the produced order and copied delivery groups and
allocations, then delegates release to `DefaultFulfillmentReleaseService` in
the Fulfillment module. Order only receives safe consignment counts and
references for history, completion, and operator support.

`DefaultCheckoutPlacementWorkflowService.recordHistory` records the order
lifecycle event after order projection, allocation copy, and Payment
authorization and Fulfillment release. It writes an
`orderHistoryEntry` with order, placement, Workflow carrier, actor, and safe
message evidence. `completePlacement` then produces final placement-run
evidence with counts for inventory reservations and copied delivery/payment
groups and allocations. These completion actions consume prior Workflow action
feedback or carrier source detail; they do not require frontend orchestration
to mutate the carrier between steps.

`DefaultCheckoutPlacementCompensationService` backs the
`compensatePlacement` Workflow action for failure recovery. It delegates
Inventory Promise Reservation release to Inventory-owned orchestration, records
safe failed placement-run evidence, and optionally writes order failure history
when an order was already projected. Order does not mutate Inventory counters,
recalculate reservations, or hide payment/fulfillment rollback logic inside its
own services.

Customer projects customize placement by layering
`order.checkoutPlacement.workflow`, `order.checkoutPlacement.pipeline`,
`order.checkoutPlacement.validation`,
`order.checkoutPlacement.inventoryReservation`,
`order.checkoutPlacement.orderProjection`,
`order.checkoutPlacement.allocationCopy`,
`order.checkoutPlacement.paymentAuthorization`,
`order.checkoutPlacement.fulfillmentRelease`,
`order.checkoutPlacement.compensation`, workflow seed data, individual Workflow
action handlers, or atomic pipeline node handlers. They must not bypass
Workflow with a direct controller-to-service order placement path, recalculate
copied split evidence inside Order, directly mutate Inventory/Payment/
Fulfillment state, or put payment gateway, Inventory, Pricing, or Fulfillment
authority inside Order.

## Checkout reverse workflow

Checkout reverse processing coordinates what happens after an order needs a
return and refund. It is a business process, so it uses Workflow. Order owns the
reverse run and order-centered history. Fulfillment owns return request,
approval, pickup, received, and disposition evidence. Payment owns refund
calculation and transaction evidence. This separation is what allows customer projects to add
inspection, restocking, provider-specific pickup, provider-specific refund rules,
notifications, or compensation without creating a second Order-owned payment or
fulfillment subsystem.

The default Order contribution is:

- Workflow heads:
  - `checkoutReverseManualFlow`
  - `checkoutReverseAutomaticFlow`
- Workflow actions:
  - `checkoutReverseStartRunAction`, handled by
    `DefaultCheckoutReverseWorkflowService.startReverseRun`
  - `checkoutReverseRequestReturnAction`, handled by
    `DefaultCheckoutReverseWorkflowService.requestReturn`
  - `checkoutReverseApproveReturnAction`, handled by
    `DefaultCheckoutReverseWorkflowService.approveReturn`
  - `checkoutReverseReceiveReturnAction`, handled by
    `DefaultCheckoutReverseWorkflowService.receiveReturn`
  - `checkoutReverseDisposeReturnAction`, handled by
    `DefaultCheckoutReverseWorkflowService.disposeReturn`
  - `checkoutReverseApplyInventoryDispositionAction`, handled by
    `DefaultCheckoutReverseWorkflowService.applyInventoryDisposition`
  - `checkoutReverseCalculateRefundAction`, handled by
    `DefaultCheckoutReverseWorkflowService.calculateRefund`
  - `checkoutReverseRefundPaymentAction`, handled by
    `DefaultCheckoutReverseWorkflowService.refundPayment`
  - `checkoutReverseRecoverFulfillmentAction`, handled by
    `DefaultCheckoutReverseWorkflowService.recoverFulfillment`
  - `checkoutReverseRecoverInventoryAction`, handled by
    `DefaultCheckoutReverseWorkflowService.recoverInventory`
  - `checkoutReverseRecoverPaymentAction`, handled by
    `DefaultCheckoutReverseWorkflowService.recoverPayment`
  - `checkoutReverseRecordHistoryAction`, handled by
    `DefaultCheckoutReverseWorkflowService.recordHistory`
  - `checkoutReverseRecoverHistoryAction`, handled by
    `DefaultCheckoutReverseWorkflowService.recoverHistory`
  - `checkoutReverseCompleteAction`, handled by
    `DefaultCheckoutReverseWorkflowService.completeReverse`
  - `checkoutReverseCompensateAction`, handled by
    `DefaultCheckoutReverseWorkflowService.compensateReverse`
- Evidence model:
  - `checkoutReverseRun`

`DefaultCheckoutReverseWorkflowService` creates and updates safe reverse-run
evidence, delegates return lifecycle work to `DefaultReturnRequestService` in
Fulfillment, delegates final return disposition to Fulfillment before refund
calculation, delegates Inventory-owned disposition movement execution when
Fulfillment produced a movement intent, loads Order payment allocation evidence for refund calculation,
delegates refundable amount calculation to `DefaultPaymentRefundCalculationService`
in Payment, delegates refund transaction work to `DefaultPaymentRefundService`
in Payment, and records an `orderHistoryEntry` when return and refund evidence
exist. It rejects raw gateway payloads, card data, carrier payloads, labels,
credentials, and secrets before they enter the workflow source detail.

`compensateReverse` records safe recovery evidence when a reverse action fails.
It infers the last reached state, selects an owner-delegated recovery strategy
from `order.checkoutReverse.compensation`, and stores searchable
`recoveryStrategy` and `recoveryOwner` fields on `checkoutReverseRun`. This is
not hidden rollback logic. If Inventory disposition already created Stock
Movement evidence and the Payment refund then fails, Order records that Payment
must retry or reconcile the refund. If the refund succeeded but Order history
failed, Order records that Order history should be retried. Inventory,
Fulfillment, and Payment remain responsible for their own correction actions.

`recoverFulfillment` is the default owner-delegated review handler for
`FULFILLMENT_REVIEW_REQUIRED` recovery. It calls Fulfillment's return recovery
review boundary and records the safe return status, configured next actions,
and recovery status on `checkoutReverseRun`. Order does not close, cancel,
approve, receive, or inspect returns during recovery.

`recoverInventory` is the default owner-delegated review handler for
`INVENTORY_REVIEW_REQUIRED` recovery. It calls Inventory's return-disposition
movement review boundary and records whether the idempotent Stock Movement
evidence already exists or whether Inventory operators must review/adjust the
movement through Inventory-owned capabilities. Order does not mutate Stock
Balance, Stock Allocation, or Stock Movement records.

`recoverPayment` is the default owner-delegated retry handler for
`PAYMENT_RETRY_REQUIRED` recovery. It calculates missing refund evidence through
the existing Payment calculation boundary when needed, then calls
`DefaultPaymentRefundService.retryRefund` or, when explicitly requested,
`reconcileRefund`. Order does not call a provider, mutate a
`paymentTransaction`, or decide gateway state; it only records the resulting
safe Payment evidence on the reverse run and then lets the Workflow continue to
history when recovery succeeds.

`recoverHistory` is the default Order-owned retry handler for
`ORDER_HISTORY_RETRY_REQUIRED` recovery. It reuses the same stable
`historyCode`, checks for an existing `orderHistoryEntry`, and writes history
only if it is missing. This means a Workflow retry can safely recover from a
history write conflict or transient database failure without creating duplicate
timeline entries and without touching Payment, Fulfillment, or Inventory state.

The BackOffice/Axis navigation metadata exposes backend-driven related panels
for reverse runs: the linked Order, Fulfillment return request, Payment refund
transaction, and Order history. Axis should render those panels through the
same reusable schema list/detail components used elsewhere, using
`recoveryStrategy` and `recoveryOwner` as operator filters rather than creating
a special reverse-checkout-only UI.

Customer projects customize reverse checkout by layering
`order.checkoutReverse.workflow`, `order.checkoutReverse.returnRequest`,
`order.checkoutReverse.inventoryDisposition`,
`order.checkoutReverse.paymentRefund`, `order.checkoutReverse.history`,
`order.checkoutReverse.compensation`, Workflow seed data, or individual
Workflow action handlers. They should keep customer notification, recovery, and
compensation as explicit owner-delegated Workflow actions instead of hiding
them in Order save interceptors or frontend calls.

## Order delivery and payment allocations

Order checkout keeps the same allocation-first shape after cart conversion.
An `orderEntry` preserves the ordered line. Delivery and payment allocation
records are the order lifecycle projection of the same logical cart checkout
structure: they preserve how each part of the ordered quantity is delivered,
paid, reserved, shipped, returned, refunded, or reconciled.

The order-owned models are:

- `orderDeliveryGroup` for one delivery destination or delivery context that
  can later become shipment or consignment input.
- `orderDeliveryAllocation` for the exact order-entry quantity assigned to one
  delivery group.
- `orderPaymentGroup` for one payment mode, authorization, capture, refund, or
  payment evidence context.
- `orderPaymentAllocation` for the exact order-entry quantity and amount
  assigned to one payment group.

This intentionally supports split delivery and split payment at quantity level:
one ordered product line with quantity `3` may allocate `2` units to address X,
`1` unit to address Y, and split payment differently across those quantities.
Optional serial, reservation, and allocation evidence fields allow later
inventory integration to bind individual stock units without changing the
checkout shape.

Cart-to-order conversion is explicit business logic, not a UI convention.
`DefaultOrderCheckoutAllocationPolicyService` provides named builders for
delivery groups, payment groups, delivery allocations, and payment allocations.
The conversion is governed by `order.checkoutAllocation.policy.conversion`,
which controls copied fields, target status, and parent-field mapping. Projects
may supply group/allocation code maps during conversion; order models retain
source cart group/allocation codes for support and audit traceability.
`DefaultCheckoutAllocationCopyService` orchestrates those builders during
checkout placement and persists only missing source records, making retries
idempotent.

Order does not become the Payment, Fulfillment, Inventory, Pricing, Tax, or
Promotion authority. It stores order-centered allocation evidence and links to
the owning authorities. Projects customize validation through layered
`order.checkoutAllocation.policy` configuration or by replacing
`DefaultOrderCheckoutAllocationPolicyService`.
