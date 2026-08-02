# fulfillment Module

`fulfillment` owns fulfillment-release, consignment, shipment, and carrier
evidence for commerce orders. Order supplies immutable delivery groups and
delivery allocations. Fulfillment groups those records into consignments and
later coordinates shipment, pickup, delivery, return pickup, and Inventory
fulfillment reconciliation.

This first foundation slice provides:

- `fulfillmentConsignment` for one warehouse/carrier/delivery release unit;
- `fulfillmentShipment` for carrier/shipment tracking evidence;
- `fulfillmentCarrierProvider` for safe carrier/provider metadata and adapter
  references;
- `fulfillmentWarehouseTask` for pick, pack, and handoff execution evidence;
- `fulfillmentTrackingEvent` for safe normalized carrier tracking event
  evidence;
- `fulfillmentReturnRequest` for return request, pickup, received, and closure
  evidence;
- `DefaultFulfillmentPolicyService` for safe lifecycle validation;
- `DefaultFulfillmentReleaseService` for idempotent order delivery release;
- `DefaultFulfillmentShipmentLifecycleService` for shipment create, label,
  dispatch, and delivery lifecycle evidence;
- `DefaultShipmentLabelService` and `DefaultCarrierLabelGatewayService` for
  safe label-reference orchestration;
- `DefaultWarehouseTaskService` for idempotent warehouse task creation and
  lifecycle transitions;
- `DefaultTrackingEventService` for normalized tracking event ingestion and
  shipment lifecycle projection;
- `DefaultReturnRequestService` for idempotent return request creation and
  governed return lifecycle transitions;
- BackOffice metadata for Fulfillment workspaces.

Fulfillment does not own stock counters or payment capture. It stores safe
release evidence and delegates stock movement/reconciliation to Inventory and
payment lifecycle to Payment.

## Checkout placement integration

Order checkout placement calls Fulfillment through a Workflow action after
Payment authorization. Fulfillment receives the produced order and copied
order delivery groups/allocations, creates one consignment per delivery group
by default, and returns safe release counts. Customer modules can change
grouping, warehouse/carrier selection, release timing, and provider behavior by
layering `fulfillment.fulfillmentPolicy` or replacing Fulfillment-owned
services.

If checkout placement fails after release, Order compensation delegates
consignment cancellation back to `DefaultFulfillmentReleaseService`. Order does
not directly mutate Fulfillment records or shipment lifecycle.

## Shipment lifecycle

Shipment lifecycle is Fulfillment-owned because it represents operational
delivery execution, not order demand and not stock ownership.

The default lifecycle is:

1. `CREATED` — Fulfillment creates idempotent shipment evidence for one
   consignment.
2. `LABELLED` — Fulfillment stores safe label/tracking references. Raw labels,
   provider payloads, credentials, and secrets are rejected.
3. `DISPATCHED` — Fulfillment marks the shipment shipped and calls Inventory's
   protected allocation fulfillment intent when the consignment carries
   inventory allocation evidence.
4. `DELIVERED` — Fulfillment marks shipment and consignment delivered.

Inventory owns stock counters and allocation reconciliation. Fulfillment only
delegates to `DefaultStockAllocationIntentService.fulfill` and records safe
references returned from the Inventory owner.

Customer modules can change carrier integration, label purchase, tracking event
handling, status transitions, and dispatch policy by layering
`fulfillment.fulfillmentPolicy` or replacing Fulfillment-owned services. They
should not mutate Inventory records directly from Fulfillment save hooks.

## Carrier providers and labels

Carrier providers are configuration and metadata, not a place to store secrets.
`fulfillmentCarrierProvider` stores the carrier code, business name, supported
delivery modes/countries, supported label/tracking flags, and an optional
Fulfillment service adapter name. Real credentials belong in governed secure
configuration or external secret systems and must be resolved by the adapter.

`DefaultShipmentLabelService` loads the shipment and active carrier provider,
resolves the configured adapter, asks it for a safe `labelRef`, and then marks
the shipment `LABELLED` through `DefaultFulfillmentShipmentLifecycleService`.
The default `DefaultCarrierLabelGatewayService` is intentionally conservative:
it creates a deterministic safe label reference for local/test providers. A
customer module replaces that gateway or configures `serviceAdapter` for a real
carrier integration.

## Warehouse task execution

Warehouse task execution is Fulfillment-owned operational evidence. It should
not be pushed back into Order, and it should not mutate Inventory counters.

`fulfillmentWarehouseTask` records pick, pack, and handoff tasks for a
consignment or shipment. The default `DefaultWarehouseTaskService` creates
configured tasks idempotently, starts tasks, completes tasks, cancels tasks,
and moves the consignment through safe operational states such as `PICKING` and
`PACKED`.

Customer modules can replace task grouping, assignment, wave picking, barcode
scanner integration, warehouse devices, or packing rules by layering
`fulfillment.fulfillmentPolicy.warehouseTaskPolicy` or replacing
`DefaultWarehouseTaskService`. Device credentials, scanner tokens, raw carrier
payloads, and internal warehouse secrets must not be stored in task evidence.

## Tracking event ingestion

Tracking events are a separate evidence stream because one shipment can receive
many carrier events over time. `fulfillmentTrackingEvent` stores normalized,
safe carrier event evidence such as event type, event time, location, and
operator-facing message. It must not store raw carrier payloads, webhook
secrets, credentials, or provider-specific response bodies.

`DefaultTrackingEventService` ingests normalized events idempotently and maps
them to shipment lifecycle status through
`fulfillment.fulfillmentPolicy.trackingEventShipmentStatusMap`. For example,
`IN_TRANSIT` and `OUT_FOR_DELIVERY` can project to shipment status
`IN_TRANSIT`, while `DELIVERED` closes the shipment and consignment through the
Fulfillment shipment lifecycle service.

Customer modules can replace carrier event normalization, mapping, event
deduplication, or webhook ingestion while preserving the safe Fulfillment event
schema and lifecycle boundary.

## Return request lifecycle

Returns are Fulfillment-owned operational evidence because Fulfillment decides
pickup, receipt, inspection, and disposition. Payment owns refund transaction
evidence, and Order will coordinate the end-to-end reverse business process
through Workflow.

`fulfillmentReturnRequest` records the safe return identity, source order,
optional source consignment/shipment, return reason, return type, requested
quantity, received quantity, inspection result, disposition, refund policy code,
and optional Inventory-owned disposition intent. It must not store raw carrier
payloads, labels, customer secrets, provider responses, payment gateway
payloads, or raw stock mutation details.

The default lifecycle is configuration-first through
`fulfillment.fulfillmentPolicy.returnTransitions`:

1. `REQUESTED` — Fulfillment records idempotent return demand evidence.
2. `APPROVED` — Fulfillment records approval/disposition/refund-policy intent.
3. `PICKUP_REQUESTED` — Fulfillment records return pickup or return-shipment
   evidence when applicable.
4. `RECEIVED` — Fulfillment records received quantity and receipt time.
5. `CLOSED` — Fulfillment closes the return after inspection/disposition and,
   when configured, records a safe Inventory movement intent such as RESTOCK,
   REPAIR, or SCRAP.

Disposition behavior is configuration-first through
`fulfillment.fulfillmentPolicy.returnDisposition`. Customer modules can change
return types, statuses, transitions, inspection, pickup-provider integration,
and disposition behavior by layering `fulfillment.fulfillmentPolicy` or
replacing `DefaultReturnRequestService`/`DefaultFulfillmentPolicyService`. They
should not create refund transactions from Fulfillment, and they should not
mutate Inventory counters directly. Refund evidence belongs in Payment and
stock movement execution belongs in Inventory, coordinated through reverse
Workflow actions.

Fulfillment also owns return recovery review. `DefaultReturnRequestService`
exposes `reviewReturnRecovery` so Order reverse Workflow can ask Fulfillment
what return state exists after a failure and which configured owner actions are
valid next. The review response is safe operator evidence only; it does not
hide approval, cancellation, inspection, pickup, or close mutations inside
Order compensation.
