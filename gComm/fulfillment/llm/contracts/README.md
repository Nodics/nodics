# Fulfillment Contracts

Fulfillment turns order delivery evidence into operational release evidence.

## Boundary

- `fulfillmentConsignment` is the Fulfillment-owned release unit created from
  one or more order delivery allocations.
- `fulfillmentShipment` is the Fulfillment-owned carrier/tracking evidence
  attached to a consignment.
- `fulfillmentCarrierProvider` is safe carrier/provider metadata and adapter
  reference data. It is not a credential store.
- `fulfillmentWarehouseTask` is Fulfillment-owned pick, pack, and handoff
  execution evidence for a consignment or shipment.
- `fulfillmentTrackingEvent` is normalized, safe carrier tracking event
  evidence and is separate from the current shipment status.
- `fulfillmentReturnRequest` is Fulfillment-owned return request, pickup,
  received, inspection, and closure evidence.
- Order remains the demand authority. Inventory remains the stock authority.
  Payment remains the money authority.
- Shipment dispatch may request Inventory fulfillment reconciliation only
  through Inventory-owned intent services. Fulfillment must not update stock
  balances, reservations, movements, or allocations directly.

## Shipment lifecycle

The default lifecycle service supports:

- `createShipment` for idempotent shipment evidence creation;
- `markLabelled` for safe label/tracking references;
- `dispatch` for shipment dispatch and Inventory-owned allocation fulfillment
  intent delegation;
- `deliver` for closing shipment and consignment delivery evidence.

Allowed transitions are configuration-first through
`fulfillment.fulfillmentPolicy.shipmentTransitions`. Provider credentials, raw
labels, raw carrier responses, and secret delivery payloads are intentionally
excluded from Fulfillment schemas.

## Warehouse tasks

`DefaultWarehouseTaskService` creates configured warehouse tasks idempotently
from a consignment, then transitions them through `OPEN`, `IN_PROGRESS`,
`COMPLETED`, `CANCELLED`, or `FAILED`.

Default task types are configured through
`fulfillment.fulfillmentPolicy.warehouseTaskPolicy.defaultTaskTypes`. The
framework default is `PICK`, `PACK`, and `HANDOFF`. Completing a pack task can
move the owning consignment to `PACKED`, but stock movement and allocation
reconciliation remain Inventory-owned.

Warehouse integrations must not store scanner credentials, device tokens, raw
labels, provider payloads, or customer secrets in warehouse task evidence.

## Tracking events

`DefaultTrackingEventService` ingests normalized tracking events idempotently,
stores safe event evidence, and optionally projects the event to shipment
lifecycle status using
`fulfillment.fulfillmentPolicy.trackingEventShipmentStatusMap`.

The framework default maps `PICKED_UP`, `IN_TRANSIT`, and `OUT_FOR_DELIVERY`
to `IN_TRANSIT`; `DELIVERED` to `DELIVERED`; and `EXCEPTION` or `FAILED` to
`FAILED`. The mapping is configuration-first and can be layered by customer
modules.

Tracking integrations must normalize carrier webhooks before persistence. Raw
carrier payloads, webhook secrets, provider responses, credentials, and private
tokens must not be stored in `fulfillmentTrackingEvent`.

## Returns

`DefaultReturnRequestService` creates return request evidence idempotently and
moves it through configured lifecycle states such as `REQUESTED`, `APPROVED`,
`PICKUP_REQUESTED`, `RECEIVED`, and `CLOSED`.

Return requests may reference order, consignment, shipment, delivery
allocation, inventory allocation, and item codes. Those references explain what
is being returned; they do not transfer Order, Inventory, or Payment authority
into Fulfillment.

Fulfillment owns pickup and received evidence. Payment owns refund transaction
evidence. A production return/refund process should be coordinated by Workflow
actions that call each owner in sequence. Do not make Fulfillment call payment
gateways directly, and do not store raw carrier/provider payloads or secrets in
`fulfillmentReturnRequest`.

Return disposition is configuration-first through
`fulfillment.fulfillmentPolicy.returnDisposition`. `DefaultReturnRequestService`
closes returns with safe inspection/disposition evidence and can record an
Inventory-owned disposition intent for RESTOCK, REPAIR, or SCRAP. That intent is
not a stock mutation. Inventory movement execution must remain in an
Inventory-owned service or Workflow action.

Return recovery review is also Fulfillment-owned.
`DefaultReturnRequestService.reviewReturnRecovery` exposes safe operator
evidence for reverse Workflow recovery: current return state, terminal or
review-required status, and configured next owner actions. Order may record
that evidence on `checkoutReverseRun`, but it must not mutate Fulfillment
return lifecycle during compensation.

## Carrier labels

`DefaultShipmentLabelService` is the default label orchestration boundary. It
loads shipment evidence, loads an active carrier provider, resolves the
provider's configured adapter service, receives a safe `labelRef`, and updates
shipment lifecycle through `DefaultFulfillmentShipmentLifecycleService`.

`DefaultCarrierLabelGatewayService` is a safe local/default gateway. Real
carrier purchase/void/tracking integrations belong in customer modules or
provider modules that replace the configured adapter. They must return safe
references only; raw labels and raw provider payloads must remain outside
Fulfillment schemas.

## Extension

Projects customize Fulfillment by layering `fulfillment.fulfillmentPolicy` or
replacing:

- `DefaultFulfillmentPolicyService`
- `DefaultFulfillmentReleaseService`
- `DefaultFulfillmentShipmentLifecycleService`
- `DefaultShipmentLabelService`
- `DefaultCarrierLabelGatewayService`
- `DefaultReturnRequestService`
- `DefaultFulfillmentPolicyService`
- `DefaultWarehouseTaskService`
- `DefaultTrackingEventService`
- `DefaultReturnRequestService`

Do not copy Order delivery allocations into a parallel Order shipment model.
Do not update Inventory counters directly from Fulfillment persistence hooks.
When checkout placement fails after fulfillment release, compensation must
cancel consignments through Fulfillment-owned services rather than mutating
Fulfillment state from Order.
