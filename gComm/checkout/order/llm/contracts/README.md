# order AI Contracts

This folder contains module-specific AI/developer contracts for `gComm/checkout/order`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Cancellation eligibility contract

Architecture decision: keep post-order lifecycle coordination in existing
owner modules. Order owns business requests; Payment owns monetary execution;
Fulfillment owns return logistics; Inventory owns stock movement. Do not add a
parallel `returns`/`orderLifecycle` authority module. Exchange execution is
deferred but must remain representable through requested outcome and return
evidence. Real PSP/carrier adapters are project-layer selections, and fraud is
normalized permission-filtered evidence until a dedicated capability is
explicitly introduced. Promotion clawback remains Promotion-owned.

Return and Refund use distinct Workflow graphs. Return nPipelines validate delivery and Product policy evidence before authorization and Fulfillment RMA creation. Refund nPipelines calculate exact Payment allocations, prepare risk-aware approval, and delegate original-rail execution to Payment. Fulfillment owns receipt and inspection, Inventory owns stock movement, and normalized events are emitted only after durable Order history.

- Use `orderCancellationEligibilityPipeline` for the deterministic technical decision; do not bypass it with controller or frontend orchestration.
- Order contributes immutable entry and already-resolved quantity evidence. Inventory, Fulfillment, Payment, and Product contribute normalized evidence through configured owner-provider services.
- Every selected entry must have complete, unit-matched owner evidence. Missing, duplicate, unsafe, noncanonical, or unsupported evidence fails closed.
- Quantity comparison uses `DefaultExactUnitsService`; JavaScript numbers and floating-point arithmetic are prohibited.
- Eligibility output may describe required owner actions, but it performs no Inventory release, Fulfillment cancellation, Payment void/refund, Product mutation, Order status mutation, or provider call.
- Projects may replace provider services or pipeline nodes through layered configuration while preserving tenant, authentication, enterprise, exactness, safety, and ownership boundaries.
- `orderCancellationCalculationPipeline` may coordinate immutable Order pricing and allocation evidence, but proportional refund money, split-payment routing, currency rounding, and refund policy remain Payment-owned.
- Tax and Promotion values in calculation output are references to accepted Order evidence; Order must not recompute Tax or discount policy. Shipping inclusion is an explicit Payment-policy decision.
- Workflow evaluation must invoke both configured nPipelines through `DefaultPipelineService`, persist safe outputs against the unchanged submitted request version, and return an idempotent stored route on retry.
- Manual approval requires authenticated human actor evidence and configured maker-checker enforcement. Auto approval is opt-in and bounded by exact amount and requester policy.
- `APPROVED` and `REJECTED` are durable Order request decisions only; they must not trigger adjacent-owner execution inside the approval action.
- Approved execution must run through `orderCancellationExecutionPipeline`.
  Its technical nodes call configured Fulfillment, Inventory, and Payment owner
  services in sequence and persist a Workflow-owned checkpoint after each
  completed owner operation.
- Pipeline retry must preserve request code and immutable version as owner
  idempotency evidence. Partial or ambiguous failure becomes
  `RECONCILIATION_REQUIRED`, never silent success.
- Order projection occurs only after owner execution. Exact cumulative entry
  cancellation and header status updates require optimistic revision guards
  and one idempotent Order history event.
- Customer/support mutation must use explicit cancellation intent routes, not
  generated lifecycle CRUD. Customer operations reload the Order and enforce
  its customer identity; support operations require distinct permissions and
  must bind create-on-behalf to the persisted Order customer.
- Intent services reconstruct immutable item snapshots from Order-owned
  records. Never trust client quantity totals, Product identity, Inventory
  references, or lifecycle revisions as immutable evidence.
- Lifecycle decisions and owner checkpoints require idempotent append-only
  Order history audit evidence.

Start with the group-level
[Commerce Checkout Foundation](../../../../llm/contracts/commerce-checkout-foundation-contract.md)
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

Before the reverse Workflow executes owner operations, Order-owned business
intent belongs in `orderLifecycleRequest` and `orderLifecycleRequestItem`.
These private schemas preserve request type, reason, authenticated requester,
version, idempotency, exact selected quantities, optional serial identities,
and bounded immutable Order evidence. Generated routers stay disabled; only
Order-owned orchestration may persist them. They do not replace Fulfillment
return-logistics evidence, Inventory movement evidence, Payment refund
transactions, or Workflow approval state.

The aggregate must be created through
`DefaultOrderLifecycleOrchestrationService.createDraft`, using
`DefaultDatabaseTransactionService` for fail-closed atomic request/item
persistence. `submit` binds one stable Workflow carrier to the immutable
submitted request version. `SUBMISSION_PENDING` and `SUBMISSION_FAILED` are
durable recovery evidence; callers must not replace them with an unsafe
multi-request sequence or directly invoke Payment, Inventory, or Fulfillment.

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
