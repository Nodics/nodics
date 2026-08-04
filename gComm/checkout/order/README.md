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

## Post-order lifecycle request foundation

### Post-order lifecycle architecture decisions

The framework uses an owner-split model. Order owns the customer/support
business request and lifecycle projection through the generic
`orderLifecycleRequest` aggregate. Payment owns refund/void transactions and
provider reconciliation. Fulfillment owns return authorization logistics,
pickup, receipt, and inspection. Inventory owns release and returned-stock
movement/disposition. These records are linked by stable evidence codes; they
are not copied into a new shared control-plane module.

Cancellation, return, and refund therefore remain coordinated capabilities in
their current owner modules. A separate `returns` or `orderLifecycle` business
module is not introduced. Customer self-service intent APIs are included now,
but generated CRUD remains private. Exchange/replacement execution is deferred;
`requestedOutcome`, return reason, condition, disposition, and original Order
references preserve the evidence needed to add it without migrating the core
request aggregate.

The framework ships provider-neutral safe adapters, not a privileged default
real PSP or carrier. The first real payment and return-logistics provider is a
project-layer selection registered behind the existing Payment/Fulfillment
adapter contracts and secret-store references. Refunds still default to the
persisted original payment provider. Fraud/risk remains normalized,
permission-filtered decision evidence in the first implementation rather than
a new first-class module. Promotion qualification clawback is deferred to a
Promotion-owned refund-impact policy; Order preserves original discount
evidence and must not implement that rule itself.

`orderLifecycleRequest` is the Order-owned business request for cancellation,
return, or refund. `orderLifecycleRequestItem` selects exact Order Entry
quantities and preserves bounded immutable references to the order evidence on
which later eligibility, approval, and execution decisions must operate.

This foundation deliberately does not execute a cancellation, receive a
return, release stock, or refund money. Workflow will own submission and
approval; Fulfillment owns return logistics and receipt; Inventory owns stock
release and disposition movements; Payment owns void/refund execution and
provider reconciliation. The existing checkout reverse Workflow remains
available while later slices are migrated to consume the Order-owned request.

Both schemas have generated routers disabled. Persistence is accepted only
with the private `_orderLifecycleMutationAuthorized` orchestration marker and
hard deletion is rejected. `DefaultOrderLifecycleRequestPolicyService` builds
and validates bounded drafts, configured request/reason types, authenticated
requester evidence, safe payloads, unique serial-number selections, and exact
positive decimal-string quantities. It never converts JavaScript numbers into
commercial quantity evidence.

Customer projects customize request types, bounds, and default reason codes by
layering `order.orderLifecycle` configuration or replacing the policy service.
They must preserve private persistence, immutable submitted versions, exact
quantities, Workflow approval, and adjacent-module ownership. Public customer,
support, or Axis intent APIs are intentionally deferred until their permission,
scope, idempotency, and audit contracts are approved.

`DefaultOrderLifecycleOrchestrationService.createDraft` persists the request
and all selected items inside the provider-neutral Nodics database transaction
contract. Both schemas opt into side-effect-free transaction participation. If
the configured database cannot guarantee atomic multi-record writes, creation
fails closed; there is no partial-write fallback. Replaying the same enterprise
and idempotency identity returns the existing aggregate.

`submit` moves a draft through `SUBMISSION_PENDING` and initializes one stable
Workflow carrier bound to the incremented immutable request version. Successful
handoff records `SUBMITTED`, the carrier code, and submission time without
changing that bound version. A failed handoff records `SUBMISSION_FAILED`; a
retry reuses the same request/version/carrier identity and asks Workflow whether
the carrier already exists before initialization. This slice still performs no
Payment, Fulfillment, Inventory, Tax, Promotion, or provider execution.

### Cancellation eligibility

`orderCancellationEligibilityPipeline` evaluates pre-fulfillment cancellation
without mutating any owner. It validates the Order state and configured window,
then obtains normalized per-entry evidence from configured Inventory,
Fulfillment, Payment, and Product provider services. Missing providers, missing
entries, duplicate entries, unsafe raw evidence, mismatched units, unsupported
payment states, and invalid exact quantities fail closed.

`DefaultOrderCancellationEligibilityService` uses the Units exact-arithmetic
contract to calculate the minimum of remaining ordered quantity, Inventory
releasable quantity, and Fulfillment cancellable quantity. Its result records
eligibility reasons, safe authority references, and planned owner actions such
as `RELEASE`, `CANCEL_RELEASE`, `VOID`, or `REFUND`. Those actions are decision
evidence only; later Workflow-owned execution must call each owning module.

Projects may layer cancellation states, windows, payment action mappings, and
provider service names through `order.orderLifecycle.cancellationEligibility`,
or replace a pipeline node. They must preserve exact quantities, fail-closed
owner evidence, tenant/auth/enterprise context, and the no-side-effect boundary.

`orderCancellationCalculationPipeline` consumes a successful eligibility
decision and immutable Order Entry/payment-allocation evidence. Order preserves
line net/gross, tax, discount, price, and Tax quote references but does not
reinterpret their business rules. It delegates exact partial and split-payment
amount calculation to `DefaultPaymentRefundCalculationService`, which keeps
currency rounding and original-payment routing under Payment authority.

The result states whether Payment policy includes tax, discount, or shipping
and contains safe allocation-level calculation evidence. It is not a refund
transaction and performs no gateway or adjacent-module action.

### Cancellation approval Workflow

`DefaultOrderCancellationWorkflowService.evaluate` is the Workflow action that
connects the technical decision pipelines to the durable lifecycle request. It
loads the exact submitted request version, invokes the configured eligibility
pipeline, invokes calculation only when eligible, and persists their safe
outputs with the same immutable version. A retry returns the stored approval
route instead of recalculating or advancing state twice.

The Workflow routes to `AUTO_APPROVE`, `MANUAL_REVIEW`, or `REJECT`. Automatic
approval is disabled by default and requires configured requester type and
maximum exact amount. Manual approval requires an authenticated human principal
and, by default, rejects self-approval by the original requester. Approval or
rejection records actor and decision evidence but executes no Inventory,
Fulfillment, Payment, or provider operation.

### Cancellation execution Pipeline

After approval, Workflow routes to `DefaultOrderCancellationWorkflowService.execute`,
which invokes the configured `orderCancellationExecutionPipeline`. Its named,
replaceable nodes validate immutable approval, cancel Fulfillment evidence,
cancel Inventory allocations, execute Payment void/refund, and finally project
the exact cancellation onto Order Entries and the Order header. Every adjacent
mutation is performed by its owning service; Order never updates their records.

Workflow checkpoints each completed owner step on the unchanged lifecycle
request version. Owner calls reuse stable cancellation identities, so retry can
re-enter the Pipeline safely. An ambiguous failure records
`RECONCILIATION_REQUIRED` instead of claiming completion. Order Entry and Order
projection use optimistic lifecycle revisions, cumulative exact quantities,
and idempotent history evidence. The header becomes `CANCELLED` only when all
entry quantities are cancelled; otherwise it becomes `PARTIALLY_CANCELLED`.

### Return and Refund execution

Return requests use `orderReturnRequestFlow`. `returnRequestValidationPipeline` combines Fulfillment delivery and Product policy evidence, while `returnAuthorizationPipeline` prepares automatic or human authorization. After authorization, Workflow creates idempotent item-level Fulfillment RMAs. Fulfillment later runs `returnReceiptDispositionPipeline`; only Inventory applies return stock movements.

Refund requests use `orderRefundRequestFlow`. `refundCalculationPipeline` adapts immutable Order selections to Payment-owned exact allocation calculation, `refundApprovalPreparationPipeline` applies configured threshold and normalized-risk routing, and `refundExecutionPipeline` delegates the approved allocation plan to Payment. Payment enforces the original captured or settled transaction, provider, method, currency, cumulative amount bound, and idempotency key.

Customer and support Return/Refund intent routes reuse the private lifecycle aggregate and immutable Order-entry snapshot. Customer access is own-order only; support access is constrained by enterprise plus assigned site and channel when those scopes are present.

### Customer and support cancellation intents

Generated lifecycle CRUD remains disabled. Customers use the secured
`/self/cancellations` intent and support uses the separately permissioned
`/operations/cancellations` intent. Both paths reload the Order and its Entries
inside Order, rebuild immutable quantity/Product/allocation snapshots, create
the private aggregate atomically, and submit it to Workflow with the supplied
idempotency key.

Customer reads and draft cancellation are restricted to the authenticated
Order customer. Support create-on-behalf must name the same customer recorded
on the Order and remain inside authenticated enterprise scope. Client-supplied
immutable evidence is ignored. Lifecycle decisions and execution checkpoints
produce idempotent append-only `orderHistoryEntry` records for support and
audit visibility.

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
