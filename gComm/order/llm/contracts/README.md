# order AI Contracts

This folder contains module-specific AI/developer contracts for `gComm/order`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Start with the group-level
[Commerce Checkout Foundation](../../../llm/contracts/commerce-checkout-foundation-contract.md)
before applying Order-specific checkout rules.

## Checkout allocation contract

Order checkout preserves cart allocation evidence after order placement. Do not
collapse split delivery, split payment, shipment, refund, or return behavior
into direct mutable arrays on `order` or direct fields on `orderEntry`.

- `orderEntry` records the ordered product quantity and immutable line
  evidence.
- `orderDeliveryGroup` and `orderDeliveryAllocation` split order-entry
  quantities by delivery destination or context.
- `orderPaymentGroup` and `orderPaymentAllocation` split order-entry quantities
  and amounts by payment mode or payment authority.
- Quantity and money fields are exact decimal strings.
- `orderEntry` freezes accepted price/tax display evidence copied from
  `cartEntry`, including net/gross line amounts, `taxTotal`,
  `taxInclusionMode`, `taxIncluded`, and Tax quote/rate references. Order does
  not recalculate this evidence after placement.
- Optional `serialNumbers`, `inventoryReservationCode`, and
  `inventoryAllocationCode` are evidence fields for Inventory and Fulfillment
  authorities; Order does not own stock or shipment calculations.

Project modules customize validation through `order.checkoutAllocation.policy`
or a replacement allocation policy service. Do not fork the OOTB schema or
introduce parallel order allocation models for customer-specific checkout
flows.

Cart and Order allocation models are separate persisted lifecycle projections
of the same logical checkout structure. Use
`DefaultOrderCheckoutAllocationPolicyService` named conversion builders to move
cart delivery/payment groups and allocations to order delivery/payment groups
and allocations. Conversion behavior must remain configuration-backed through
`order.checkoutAllocation.policy.conversion`; projects may provide code maps
while preserving source cart group/allocation codes for traceability.
`DefaultCheckoutAllocationCopyService` is the checkout-placement orchestration
service that uses those builders and generated Order services to copy only
missing source records, so Workflow retries remain idempotent. It must freeze
cart split evidence; it must not recalculate quantities, amounts, stock, or
payment decisions.
Order entry Axis presentation is configured through module-owned BackOffice
`workbenchPresentation` metadata. Projects may layer different columns or
detail sections, but they must not move order-entry evidence rendering into a
custom Axis-only data model.

## Checkout placement workflow contract

Checkout placement must use the existing Workflow and nPipeline capabilities:

- Workflow carries durable business lifecycle, manual review, retry, recovery,
  and action/channel routing.
- `checkoutPlacementRunPipeline` is only an atomic technical pipeline for
  placement-run evidence.
- `checkoutPlacementRun` is Order-owned operational evidence for one placement
  attempt.
- `DefaultCheckoutPlacementWorkflowService.submit` creates/releases a Workflow
  carrier.
- Checkout placement stages are separate Workflow action handlers:
  `startPlacementRun`, `validatePlacement`, `reserveInventory`,
  `createOrderProjection`, `copyAllocations`, `authorizePayment`,
  `releaseFulfillment`, `recordHistory`, and `completePlacement`.
- `DefaultOrderCheckoutPlacementValidationService` backs `validatePlacement`
  and validates cart readiness, enterprise scope, distributed delivery/payment
  references, and exact allocation totals before inventory reservation.
- `DefaultCheckoutInventoryReservationService` backs `reserveInventory` by
  mapping configured checkout allocations to Inventory Promise Reservation
  requests. Inventory remains authoritative for promise counters, overbooking,
  and payment requirements.
- `DefaultCheckoutOrderProjectionService` backs `createOrderProjection` by
  creating an idempotent Order header and Order Entries from validated Cart
  evidence while preserving cart/workflow/placement traceability.
- `DefaultCheckoutAllocationCopyService` backs `copyAllocations` by copying
  Cart delivery/payment groups and allocations into Order-owned evidence while
  retaining source cart group/allocation codes.
- `authorizePayment` must delegate to
  `DefaultPaymentCheckoutAuthorizationService` in the Payment module after
  order payment groups exist. Order may keep safe evidence/counts, but it must
  not own provider, authorization, capture, refund, void, or gateway behavior.
- `releaseFulfillment` must delegate to `DefaultFulfillmentReleaseService` in
  the Fulfillment module after order delivery groups and allocations exist.
  Order may keep safe consignment evidence/counts, but it must not own
  shipment, carrier, packing, delivery, warehouse task, or return-pickup
  behavior.
- `recordHistory` must create order-centered lifecycle evidence after order
  projection, allocation copy, Payment authorization, and Fulfillment release.
  It must resolve order, placement, carrier, actor, safe Payment evidence, and
  safe Fulfillment evidence from Workflow action feedback or carrier source
  detail.
- `completePlacement` must finalize placement-run evidence with safe counts and
  references for operators and recovery. It must not rely on frontend-driven
  carrier mutation between Workflow actions.
- `DefaultCheckoutPlacementCompensationService` backs `compensatePlacement`.
  It may release Inventory Promise Reservations only by delegating to
  Inventory-owned orchestration, and it must record safe failure evidence on
  checkout placement runs. It must not directly mutate Inventory counters,
  payment captures, fulfillment, or copied order allocations.

Do not implement checkout placement as a standalone monolithic service or a
frontend-driven sequence. Project modules may customize by layering workflow
heads/actions/channels, `order.checkoutPlacement` properties, pipeline
definitions for atomic tasks, individual Workflow action services, or pipeline
node services.

## Checkout reverse workflow contract

Checkout reverse processing must use Workflow because return/refund handling is
a business process with multiple owners, approvals, retries, and recovery
points.

- `checkoutReverseRun` is Order-owned operational evidence for one reverse
  checkout attempt.
- `DefaultCheckoutReverseWorkflowService.submit` creates/releases a Workflow
  carrier for an order return/refund request.
- Reverse stages are separate Workflow action handlers:
  `startReverseRun`, `requestReturn`, `approveReturn`, `receiveReturn`,
  `disposeReturn`, `applyInventoryDisposition`, `calculateRefund`,
  `refundPayment`, `recoverFulfillment`, `recoverInventory`,
  `recoverPayment`, `recordHistory`, `recoverHistory`, `completeReverse`, and
  `compensateReverse`.
- `requestReturn`, `approveReturn`, `receiveReturn`, and `disposeReturn` must delegate to
  `DefaultReturnRequestService` in Fulfillment. Order may keep safe return
  references, but it must not own return pickup, received, inspection, or
  disposition evidence.
- `disposeReturn` must run before refund calculation so inspection/disposition
  evidence, including any Inventory-owned disposition intent, is visible to the
  reverse workflow.
- `applyInventoryDisposition` must delegate Inventory-owned disposition intent
  execution to `DefaultReturnDispositionMovementService` before refund
  calculation when a movement intent exists. Order may keep safe result
  references, but it must not own Stock Movement, Stock Balance, reservation, or
  allocation mutation.
- `recoverFulfillment` must only run for `FULFILLMENT_REVIEW_REQUIRED`
  recovery. It may ask Fulfillment for safe return state and configured next
  owner actions, but it must not close, cancel, inspect, approve, or receive
  return evidence directly.
- `recoverInventory` must only run for `INVENTORY_REVIEW_REQUIRED` recovery.
  It may ask Inventory whether idempotent Stock Movement evidence already
  exists or whether Inventory review/adjustment is required, but it must not
  mutate Stock Balance, Stock Allocation, or Stock Movement records.
- `calculateRefund` must load safe Order payment allocation evidence through the
  configured allocation source service and delegate refundable amount
  calculation to `DefaultPaymentRefundCalculationService` in Payment.
- `refundPayment` must delegate to `DefaultPaymentRefundService` in Payment
  using calculated refund evidence. Order may keep safe calculation and
  transaction references, but it must not own PSP refund, capture, void,
  settlement, dispute, or gateway behavior.
- `recoverPayment` must only run for `PAYMENT_RETRY_REQUIRED` recovery. It may
  calculate missing refund evidence through the existing Payment calculation
  boundary, then delegate retry or reconciliation to
  `DefaultPaymentRefundService`. It must not call payment providers or mutate
  Payment transaction lifecycle directly.
- `recordHistory` must create order-centered lifecycle evidence only after
  Fulfillment return and Payment refund evidence exist.
- `recoverHistory` must only run for `ORDER_HISTORY_RETRY_REQUIRED` recovery.
  It must reuse the same stable reverse `historyCode`, read before save when the
  generated history service supports lookup, and avoid duplicate
  `orderHistoryEntry` records. It must not touch Payment, Fulfillment, or
  Inventory state.
- `completeReverse` must finalize reverse-run evidence with safe references for
  operators and recovery.
- `compensateReverse` must record safe owner-delegated recovery evidence on
  `checkoutReverseRun`. It may infer states such as
  `INVENTORY_DISPOSITION_APPLIED`, `REFUND_CALCULATED`, or `REFUNDED`, select a
  strategy from `order.checkoutReverse.compensation.recoveryStrategies`, and
  expose searchable `recoveryStrategy` and `recoveryOwner` fields. It must not
  directly undo Stock Movement, mutate Payment transactions, cancel
  Fulfillment evidence, or hide provider-specific rollback in Order.
- Checkout reverse BackOffice navigation must stay backend-driven. Related
  panels should use reusable schema detail metadata to expose the linked Order,
  Fulfillment return request, Payment refund transaction, and Order history.
  Axis should filter and inspect recovery runs through schema-backed fields
  such as `state`, `recoveryStrategy`, and `recoveryOwner`.
- Reverse workflow request and evidence payloads must not contain raw gateway
  payloads, card data, carrier payloads, labels, credentials, or secrets.

Project modules may customize reverse processing through
`order.checkoutReverse` properties, reverse Workflow heads/actions/channels, or
replacement action services. Refund calculation, inventory disposition,
notifications, recovery, and compensation should be explicit owner-delegated
Workflow actions rather than hidden Order mutations.
