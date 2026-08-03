# Fulfillment Core

`fulfillmentCore` implements the logical `fulfillment` capability for
fulfillment-release, consignment, shipment, and carrier
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

Fulfillment also does not own the customer-facing delivery charge. Pricing owns
delivery charge quotes, and Order preserves the accepted quote evidence on
order delivery groups. Fulfillment may introduce carrier actual-cost,
shipment-invoice, surcharge, or reconciliation evidence later, but those
operational costs must be modeled separately from the commercial charge the
customer accepted during checkout.

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

## Shipping modes versus carrier providers

Fulfillment keeps shipping modes and carrier providers as two separate extension
layers.

A shipping mode is the business option selected during checkout or operations,
such as `STANDARD`, `EXPRESS`, `SAME_DAY`, `SCHEDULED`, `PICKUP`,
`LOCAL_DELIVERY`, `DIGITAL_DELIVERY`, or `FREIGHT`. It describes the promise,
label requirement, and provider types allowed for that delivery experience.

A carrier provider is the operational adapter boundary that can execute the
mode. Examples include DHL, FedEx, UPS, Aramex, a local fleet, a freight
partner, a pickup network, WMS/ERP handoff, a carrier aggregator, or a
customer-specific delivery partner.

This separation lets a customer add a new business shipping option without
rewriting carrier integration code, and it lets a carrier change without
rewriting Order, Cart, or checkout allocation models.

## How to add a shipping mode

Customer modules add shipping modes by layering Fulfillment configuration or by
creating governed `fulfillmentMode` records for the enterprise.

At minimum, a shipping mode needs:

- `modeCode` — stable code such as `EVENING_DELIVERY`;
- `displayName` — business-facing label;
- `defaultCarrierCode` — optional default provider;
- `carrierRequired` — whether a carrier/provider must be resolved;
- `labelRequired` — whether label generation is normally expected;
- `allowedProviderTypes` — safe provider categories that can serve the mode.

For example, a customer project can add:

```js
fulfillment: {
  fulfillmentPolicy: {
    modes: {
      EVENING_DELIVERY: {
        modeCode: 'EVENING_DELIVERY',
        displayName: 'Evening delivery',
        defaultCarrierCode: 'localFleetProvider',
        carrierRequired: true,
        labelRequired: false,
        allowedProviderTypes: ['LOCAL_DELIVERY'],
      },
    },
  },
}
```

Order still owns delivery demand and allocations. Fulfillment only interprets
the mode when releasing consignments, creating shipments, requesting labels,
or ingesting tracking evidence.

## How to add a delivery partner or carrier provider

Customer modules add delivery partners by layering `carrierProviders` or by
creating governed `fulfillmentCarrierProvider` records. A provider should carry
safe metadata only:

- `carrierCode`;
- `name`;
- `providerType`;
- supported `modeCodes` or `supportedDeliveryModes`;
- `supportsLabels`;
- `supportsTracking`;
- adapter or policy service names such as `serviceAdapter` or `adapterService`;
- a safe `configurationRef` if the adapter needs to look up external settings.

Credentials belong in governed secure configuration, secret stores, or a
secure connector owned by the customer module. They must not be persisted in
Fulfillment records, shipment records, tracking events, labels, warehouse
tasks, or return requests.

Customer modules can replace carrier integration by registering a provider
adapter service and pointing the provider metadata at it:

```js
fulfillment: {
  fulfillmentPolicy: {
    carrierProviders: {
      dhlProvider: {
        carrierCode: 'dhlProvider',
        name: 'DHL',
        providerType: 'CARRIER',
        modeCodes: ['STANDARD', 'EXPRESS'],
        supportsLabels: true,
        supportsTracking: true,
        adapterService: 'CustomerDhlCarrierAdapterService',
        policyService: 'DefaultFulfillmentCarrierPolicyService',
        configurationRef: 'secret://customer/dhl/default',
        status: 'ACTIVE',
      },
    },
  },
}
```

The adapter should return normalized evidence only: label references, tracking
numbers, tracking URLs, carrier event codes, and safe status messages. Raw
carrier responses, credentials, request payloads, and private keys remain
outside persisted business records.

## External delivery partner integration

External delivery partner integration follows the same provider-adapter pattern
used by Payment:

1. Define or persist the business shipping mode.
2. Register a safe carrier provider record.
3. Implement a customer-owned adapter service for label, dispatch, cancel,
   tracking, pickup, return, or reconciliation operations.
4. Layer provider policy when routing depends on tenant, enterprise, country,
   region, postal code, channel, product type, weight, warehouse, SLA, risk,
   or partner availability.
5. Keep Order and Inventory ownership intact. Order owns demand; Inventory owns
   stock and allocation counters; Fulfillment owns operational delivery
   evidence and delegates to external carriers through adapters.

When a real provider is introduced, the customer module should add focused
contracts for timeout handling, retry/failover behavior, duplicate webhook
handling, idempotency keys, and reconciliation evidence.

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
