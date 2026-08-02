# Commerce Checkout Foundation Contract

This contract explains how Nodics models a checkout journey from a beginner
point of view and then names the backend contracts that advanced teams extend.
It is intentionally written as framework documentation, not as one customer
project's implementation notes.

## 1. What checkout means in Nodics

Checkout is the controlled journey that turns a commercial intent into a
durable order. A customer or business user chooses products, quantities,
delivery destinations, payment methods, and fulfillment expectations. Nodics
must preserve those choices without collapsing them into one simple line item,
because real enterprise checkout is rarely simple.

For example:

- one product line may have quantity `3`;
- quantity `2` may ship to address `A`;
- quantity `1` may ship to address `B`;
- the same line may be paid partly by card, partly by cash on delivery, or
  partly by an advance payment;
- one unit may be physically in stock;
- another unit may be preorder, backorder, drop-ship, digital, or overbooked;
- later fulfillment may attach inventory reservations, allocations, serial
  numbers, shipment evidence, returns, refunds, or reconciliation evidence.

Nodics therefore treats checkout as an allocation-first model. The cart/order
entry records "what is being bought". Delivery, payment, and inventory promise
records explain how each part of that quantity will be handled.

## 2. Ownership boundaries

Each module owns one part of the truth.

| Module        | Owns                                                                                                                     | Does not own                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `cart`        | Mutable checkout intent, cart entries, cart delivery groups, cart payment groups, cart quantity allocations              | Product authority, final order history, physical stock, payment capture       |
| `order`       | Durable order projection after placement, order entries, copied delivery/payment allocations, order history              | Cart mutation, product authority, physical stock, payment capture             |
| `inventory`   | Stock balances, stock reservations, stock allocations, stock movements, inventory promises, promise reservations         | Cart/order lifecycle, money capture, payment gateway processing               |
| `payment`     | Payment providers, transaction evidence, authorization/deferred payment boundaries, future capture/refund/void lifecycle | Cart/order lifecycle, product authority, physical stock, shipment fulfillment |
| `fulfillment` | Consignments, shipment/tracking evidence, delivery release, future carrier and return-pickup lifecycle                   | Order demand authority, Inventory stock counters, Payment capture/refund      |
| `pricing`     | Price lists, price records, price group resolution, online price publication evidence                                    | Cart ownership or payment capture                                             |
| `product`     | Product identity, classifications, variants, product media, product publication evidence                                 | Cart/order ownership or stock quantities                                      |
| `store`       | Store and warehouse assignment context                                                                                   | Stock balances or checkout allocation state                                   |

This boundary is important. Customer modules should extend the owning module or
layer configuration over it. They should not create parallel cart, order,
stock, payment, or product models to bypass framework ownership.

## 3. Core checkout model map

### Cart side

`cart` is the active checkout container.

`cartEntry` is one requested product line. It keeps the product identity,
quantity, unit, and price/total evidence as exact decimal strings.

`cartDeliveryGroup` represents a delivery destination or delivery context for
the cart. A group might be a home delivery address, pickup store, warehouse
pickup, digital delivery target, or a customer-specific delivery grouping.

`cartDeliveryAllocation` links part of a `cartEntry` quantity to one
`cartDeliveryGroup`. This is how quantity `3` can become `2` to address `A` and
`1` to address `B`.

`cartPaymentGroup` represents a payment intent or payment authority context.
It might be card, cash on delivery, wallet, advance payment, deposit, balance
payment, or another project-defined payment type.

`cartPaymentAllocation` links part of a `cartEntry` quantity and amount to one
`cartPaymentGroup`.

### Pricing and tax evidence during checkout

Checkout must be able to answer two business questions at the same time:

1. What amount did the customer see and accept?
2. What tax was applied inside or on top of that amount?

Many businesses configure product prices as tax-exclusive. In that model, the
displayed item price is the net amount and tax is added during checkout. Other
businesses configure prices as tax-inclusive. In that model, the displayed
item price already includes tax, but invoices, receipts, support screens,
exports, and legal audit still need to show the applied tax portion.

Nodics keeps these concepts separate:

- Pricing resolves the commercial price and tax context. It may expose
  `taxInclusionMode`, `taxCountryCode`, `taxJurisdictionCode`, and
  `taxCategoryCode` as hints for Tax.
- Tax calculates or records the tax quote evidence. It owns
  `taxQuote` and `taxQuoteLine`.
- Cart stores the accepted checkout-line display evidence on `cartEntry`.
- Order copies and freezes the same evidence on `orderEntry` during placement.

For a tax-inclusive item that is displayed as `100.00 AED`, Tax might split the
line as:

```json
{
  "taxableAmount": "95.24",
  "netAmount": "95.24",
  "grossAmount": "100.00",
  "taxAmount": "4.76",
  "taxInclusionMode": "TAX_INCLUSIVE",
  "taxIncluded": true
}
```

The customer-facing amount is still `100.00 AED`, but the applied tax is no
longer hidden. Business users can see that `4.76 AED` was included in the
displayed price and which jurisdiction/category/rate produced the evidence.

Cart entries carry the accepted snapshot:

```json
{
  "entryCode": "line1",
  "currencyCode": "AED",
  "unitPrice": "100.00",
  "unitNetAmount": "95.24",
  "unitGrossAmount": "100.00",
  "lineNetAmount": "95.24",
  "lineGrossAmount": "100.00",
  "taxTotal": "4.76",
  "taxInclusionMode": "TAX_INCLUSIVE",
  "taxIncluded": true,
  "taxQuoteCode": "quote-cart-1",
  "taxQuoteLineCode": "quote-line1",
  "taxJurisdictionCode": "UAE-DXB",
  "taxCategoryCode": "STANDARD",
  "taxRateCode": "standard-vat"
}
```

Order entries copy those fields without recalculation. This matters because
pricing, tax rates, exemptions, or provider behavior may change after checkout.
The order must preserve what was accepted at the time of placement.

### Order side

`order` is the durable result after checkout placement.

`orderEntry` is the copied order line. It preserves the commercial evidence
from the cart entry at the time of placement.

`orderDeliveryGroup`, `orderDeliveryAllocation`, `orderPaymentGroup`, and
`orderPaymentAllocation` are order-side lifecycle projections of the cart-side
delivery/payment structures. They preserve source cart group/allocation codes
so support teams can trace how the order was created.

`orderHistoryEntry` records order lifecycle history. It is evidence, not a
place to rewrite checkout allocation rules.

`checkoutPlacementRun` records one cart-to-order placement attempt. It is
Order-owned evidence that links the source cart, produced order, Workflow
carrier, configured pipeline, idempotency key, current state, and safe
operator-visible failure/evidence data.

`checkoutReverseRun` records one order return/refund workflow attempt. It is
Order-owned evidence that links the order, Workflow carrier, Fulfillment return
request, Payment refund calculation and refund transaction, idempotency key,
current state, and safe operator-visible failure/evidence data.

### Payment side

`paymentProvider` stores safe provider identities and supported payment modes
or operations. It must never store credentials, card numbers, CVV, PAN values,
or raw gateway payloads. Customer projects connect real providers by replacing
Payment-owned services or adding provider modules, not by putting gateway
logic into Cart or Order.

`paymentTransaction` stores safe transaction evidence for authorization,
deferred payment, capture, refund, void, failed attempts, and future
settlement/reconciliation work. Amounts are exact decimal strings. The record
links back to order/payment group evidence but remains Payment-owned.

`DefaultPaymentRefundService` creates idempotent refund transaction evidence
from return or order-adjustment context. It delegates provider interaction to
the Payment provider boundary and rejects raw gateway payloads, credentials,
card data, or secrets.

Payment also owns refund recovery. A reverse workflow may ask Payment to retry
or reconcile a failed refund, but the retry uses the same Payment-owned
idempotency key and `paymentTransaction` identity. Order records recovery
progress on `checkoutReverseRun`; it does not become a payment gateway or a
transaction mutator.

Order owns reverse history recovery. If Payment refund succeeded but Order
history recording failed, the reverse workflow can retry `orderHistoryEntry`
creation using the same stable `historyCode`. This makes support history
recoverable without duplicate timeline entries and without re-running the
Payment refund.

Fulfillment owns return recovery review. A reverse workflow may ask
Fulfillment to inspect the current return request state and return configured
next actions such as review, close, or cancel, but Order must not perform those
mutations itself.

Inventory owns return-disposition recovery review. A reverse workflow may ask
Inventory whether the idempotent Stock Movement evidence for a disposition
already exists or whether Inventory operators must review/adjust it, but Order
must not mutate Stock Balance, Stock Allocation, or Stock Movement records.

`DefaultPaymentRefundCalculationService` calculates eligible refund amounts from
Order payment allocation evidence before a provider refund is created. This is
the extension point for split payments, partial returns, tax/discount/shipping
inclusion policy, goodwill adjustments, and customer-specific rounding while
keeping exact decimal-string money handling in Payment.

### Fulfillment side

`fulfillmentConsignment` stores one delivery-release unit for an order. The
default release groups order delivery allocations by order delivery group. A
customer project can group by warehouse, carrier, route, pickup point, split
package, or another governed policy by replacing Fulfillment-owned services.

`fulfillmentShipment` stores carrier/tracking evidence for a consignment. It
must not store carrier credentials, raw labels, raw provider responses, or
secret delivery data. Labels should live in governed Media or provider systems
and be referenced safely.

`fulfillmentCarrierProvider` stores safe carrier/provider metadata and adapter
references. It can say that a carrier supports labels or tracking and name the
Fulfillment-owned adapter service to call. It must not store provider
credentials or raw provider payloads.

`fulfillmentWarehouseTask` stores operational pick, pack, and handoff task
evidence for a consignment or shipment. It is Fulfillment evidence, not an
Order line and not an Inventory counter. A customer project can replace task
grouping, assignment, wave picking, or warehouse-device integration through
Fulfillment-owned services.

`fulfillmentTrackingEvent` stores safe normalized carrier tracking events as an
append-only evidence stream. Shipment status is the current lifecycle
projection; tracking events are the detailed history that explains how carrier
signals changed that projection.

`fulfillmentReturnRequest` stores Fulfillment-owned return request, pickup,
received, inspection, and closure evidence. It may reference order,
consignment, shipment, delivery allocation, inventory allocation, and item
codes, but it does not own refunds or payment gateway interaction.

`DefaultReturnRequestService.reviewReturnRecovery` returns safe review evidence
for failed reverse workflows: the current return status, disposition evidence,
terminal/review-required status, and configured next owner actions. It is not a
hidden rollback path.

Shipment lifecycle is a Fulfillment concern. The default lifecycle creates
idempotent shipment evidence, stores safe label/tracking references, dispatches
the shipment, and marks delivery complete through governed status transitions.

Fulfillment does not own Order demand or Inventory counters. When dispatch
requires stock movement or allocation reconciliation, Fulfillment calls
Inventory-owned intents such as `DefaultStockAllocationIntentService.fulfill`
and stores only safe references.

### Inventory side

`stockBalance` stores physical stock quantity and reserved quantity.

`stockReservation` reserves physical on-hand stock against a stock balance.

`stockAllocation` assigns active reservations to demand and records allocated,
backordered, and fulfilled quantity evidence.

`DefaultReturnDispositionMovementService.reviewDispositionRecovery` returns
safe recovery evidence for failed reverse workflows: whether the expected
idempotent movement exists, which movement codes were found, and which
Inventory-owned review/adjustment actions remain. It is not a Stock mutation.

`inventoryPromise` stores sellable capacity that may or may not be immediately
backed by on-hand stock. Promise types include `STOCK`, `PRE_ORDER`,
`BACKORDER`, `PERPETUAL`, `DROP_SHIP`, `MADE_TO_ORDER`, and `DIGITAL`.

`inventoryPromiseReservation` links checkout or order demand to one
`inventoryPromise`. It can reserve a `STANDARD` promise bucket or an
`OVERBOOKED` bucket.

## 4. Quantity split example

Suppose the cart has one entry:

```json
{
  "entryCode": "line1",
  "itemCode": "phone",
  "quantity": "3",
  "unitCode": "EA"
}
```

A distributed delivery checkout can be represented as:

```json
[
  {
    "allocationCode": "line1-home",
    "entryCode": "line1",
    "deliveryGroupCode": "home-address-a",
    "quantity": "2"
  },
  {
    "allocationCode": "line1-office",
    "entryCode": "line1",
    "deliveryGroupCode": "office-address-b",
    "quantity": "1"
  }
]
```

The sum of delivery allocations for `line1` must equal the entry quantity. The
same principle applies to payment allocations. A line can be split by delivery,
payment, inventory promise, and later serial-number evidence without losing the
original commercial line.

## 5. Overbooking example

Inventory can publish preorder capacity:

```json
{
  "promiseCode": "phone-preorder",
  "promiseType": "PRE_ORDER",
  "promisedQuantity": "100",
  "reservedQuantity": "100",
  "overbookingAllowed": true,
  "overbookingQuantity": "20",
  "overbookedQuantity": "19",
  "commercialPolicyCode": "preorderAdvancePolicy"
}
```

The normal preorder capacity is exhausted because `reservedQuantity` already
equals `promisedQuantity`. One more unit can still be accepted because the
overbooking capacity has one remaining unit. Nodics records this as an
`inventoryPromiseReservation` in the `OVERBOOKED` bucket. It must carry a
payment requirement such as `ADVANCE` or `DEPOSIT`.

Inventory stores the requirement and commercial policy code. It does not
calculate or capture money. Checkout/payment modules use that information to
decide what payment actions are required.

## 6. Current implementation status

Implemented now:

- cart entries;
- cart delivery/payment groups;
- cart delivery/payment allocations;
- order entries;
- order delivery/payment groups;
- order delivery/payment allocations;
- cart-to-order allocation conversion builders;
- workflow-backed checkout placement foundation with `checkoutPlacementRun`,
  `checkoutPlacementRunPipeline` for atomic placement-run evidence, seeded
  business-level Workflow heads/actions/channels, and an Order-owned Workflow
  action bridge;
- checkout placement validation for cart readiness, enterprise scope,
  distributed delivery/payment references, and exact allocation totals before
  inventory reservation;
- checkout inventory reservation bridge from configured checkout allocations to
  Inventory-owned Promise Reservation orchestration;
- checkout order projection from validated Cart header/entries to idempotent
  Order header/entries with source traceability;
- checkout allocation copy from Cart delivery/payment groups and allocations
  to Order-owned delivery/payment evidence, preserving source group/allocation
  codes and idempotent retry behavior;
- Payment module foundation with `paymentProvider`, `paymentTransaction`,
  exact-money transaction policy, safe provider boundary, BackOffice metadata,
  and checkout payment authorization orchestration;
- checkout placement Payment authorization Workflow action that delegates
  order payment groups to Payment before history/completion and returns safe
  authorization/deferred evidence;
- Fulfillment module foundation with `fulfillmentConsignment`,
  `fulfillmentShipment`, safe lifecycle policy, BackOffice metadata, and
  idempotent order delivery release orchestration;
- checkout placement Fulfillment release Workflow action that delegates copied
  order delivery groups and allocations to Fulfillment after Payment
  authorization and before order history/completion;
- Fulfillment shipment lifecycle service for create, label, dispatch, and
  delivery evidence, including configured transitions and Inventory-owned
  allocation fulfillment intent delegation during dispatch;
- Fulfillment carrier provider foundation with safe provider metadata,
  configuration-driven label gateway resolution, and shipment label-reference
  orchestration through `DefaultShipmentLabelService`;
- Fulfillment warehouse task foundation with `fulfillmentWarehouseTask`,
  configuration-driven task types/statuses, and idempotent pick/pack/handoff
  task orchestration through `DefaultWarehouseTaskService`;
- Fulfillment tracking event foundation with `fulfillmentTrackingEvent`,
  configuration-driven event-to-shipment status mapping, idempotent ingestion,
  and safe lifecycle projection through `DefaultTrackingEventService`;
- Fulfillment return request foundation with `fulfillmentReturnRequest`,
  configuration-driven return types/statuses/transitions, idempotent request
  creation, pickup request evidence, received quantity evidence, safe
  disposition intent evidence, and closure through `DefaultReturnRequestService`;
- Payment refund foundation with allocation-driven refund calculation,
  idempotent `REFUND` `paymentTransaction` evidence, exact-money validation,
  safe provider-boundary delegation, and raw-gateway-payload rejection through
  `DefaultPaymentRefundCalculationService` and `DefaultPaymentRefundService`;
- reverse checkout Workflow foundation with `checkoutReverseRun`, manual and
  automatic Workflow heads/actions/channels, Fulfillment return delegation,
  Fulfillment disposition delegation, Inventory disposition movement delegation,
  Payment refund calculation and refund delegation, order history recording, and
  safe completion and owner-delegated recovery evidence through
  `DefaultCheckoutReverseWorkflowService`;
- checkout placement completion evidence, including order history recording
  and final placement-run evidence for operators and recovery;
- checkout placement compensation boundary that delegates Inventory Promise
  Reservation release to Inventory, delegates Fulfillment consignment
  cancellation to Fulfillment, and records secret-safe failure evidence;
- stock balance, movement, reservation, allocation, transfer, sourcing, and
  availability foundations;
- Inventory-owned return disposition movement execution through
  `DefaultReturnDispositionMovementService`, converting Fulfillment RESTOCK,
  REPAIR, or SCRAP intent into governed Stock Movement evidence;
- inventory promises and promise reservations;
- idempotent inventory promise reservation reserve/release orchestration with
  revision-guarded standard and overbooked counters;
- BackOffice/Axis metadata for the current schema workspaces;
- backend-driven Axis presentation metadata for cart entry, order entry,
  tax quote, and tax quote line tax display evidence, including curated
  default columns and reusable detail sections;
- contract tests for quantity splits, conversion, promise bucket evaluation,
  and overbooking payment requirements.

Not implemented yet:

- transaction/outbox hardening that makes promise reservation row creation and
  promise counter updates atomically recoverable under concurrent infrastructure
  failure;
- full production checkout placement side effects across cart, order,
  inventory promise, payment, fulfillment, compensation, and outbox-backed
  recovery;
- real payment gateway connectors, capture, provider-specific refund, void, settlement, dispute,
  reconciliation, and secure provider-secret management integrations;
- real external carrier adapters, label purchase/voiding, production warehouse
  device/wave/picking integrations, delivery tracking event ingestion,
  provider-specific return pickup lifecycle, and production-grade Inventory stock-movement
  reconciliation from shipped/delivered events;
- production reverse-order extensions for customer notification, inspection
  automation, provider-specific return pickup, provider-specific payment retry
  automation, and disposition exception handling;
- promotion engine;
- serial-number-level inventory fulfillment orchestration.

These are future slices and must be added through owning modules instead of
hidden shortcuts.

## 7. Configuration-first extension model

Projects customize checkout behavior by layering configuration in later modules.
Examples:

- select manual or automatic checkout placement workflow through
  `order.checkoutPlacement.workflow`;
- replace or reorder checkout placement pipeline nodes through
  `order.checkoutPlacement.pipeline` and `src/pipelines/pipelines.js`;
- add new delivery group types through `cart.checkoutAllocation.policy`;
- add new payment group types through `cart.checkoutAllocation.policy`;
- tune allowed allocation statuses through cart/order checkout allocation
  policy;
- change cart-to-order copied fields through
  `order.checkoutAllocation.policy.conversion`;
- change cart-to-order entry tax evidence fields through
  `order.checkoutEntry.policy.conversion.copiedFields` while preserving
  immutable order-entry evidence;
- configure tax inclusion modes through `tax.rate.taxInclusionModes` and
  cart/order checkout entry policy `taxInclusionModes`;
- configure Axis schema workspace presentation through module-owned
  `backofficeCapabilities.<module>.navigation[].workbenchPresentation`
  metadata, such as `defaultColumns`, `readonlyFields`, and `detailSections`;
- enable, disable, or replace checkout allocation copy through
  `order.checkoutPlacement.allocationCopy` and
  `DefaultCheckoutAllocationCopyService`;
- enable or replace checkout payment authorization through
  `order.checkoutPlacement.paymentAuthorization` while delegating lifecycle
  work to the Payment module;
- customize payment modes, provider mapping, transaction states, exact-money
  rules, and failure-message policy through `payment.paymentPolicy`;
- replace `DefaultPaymentProviderGatewayService` or
  `DefaultPaymentCheckoutAuthorizationService` in a customer module to connect
  real payment providers without changing Cart or Order;
- enable or replace checkout fulfillment release through
  `order.checkoutPlacement.fulfillmentRelease` while delegating shipment and
  consignment lifecycle to the Fulfillment module;
- customize consignment grouping, carrier/warehouse selection, shipment
  statuses, shipment transitions, and release policy through
  `fulfillment.fulfillmentPolicy`;
- replace `DefaultFulfillmentReleaseService` or
  `DefaultFulfillmentPolicyService` in a customer module without changing
  Order or Inventory;
- replace `DefaultFulfillmentShipmentLifecycleService` to connect carrier
  providers, label generation, tracking event feeds, or warehouse-dispatch
  hooks while preserving Fulfillment ownership and Inventory intent delegation;
- configure `fulfillment.fulfillmentPolicy.labelPolicy` or
  `fulfillmentCarrierProvider.serviceAdapter` to route label requests to a
  customer-owned carrier gateway service;
- configure `fulfillment.fulfillmentPolicy.warehouseTaskPolicy` or replace
  `DefaultWarehouseTaskService` to change pick/pack/handoff task creation,
  assignment, scanner integration, or warehouse execution rules;
- configure `fulfillment.fulfillmentPolicy.trackingEventShipmentStatusMap` or
  replace `DefaultTrackingEventService` to change carrier event normalization,
  deduplication, or lifecycle projection;
- configure `fulfillment.fulfillmentPolicy.returnTypes`,
  `returnStatuses`, and `returnTransitions` or replace
  `DefaultReturnRequestService` to change return approval, pickup, receipt,
  inspection, or disposition behavior;
- configure `inventory.stockAllocation.returnDisposition` or replace
  `DefaultReturnDispositionMovementService` to change how RESTOCK, REPAIR, or
  SCRAP disposition intent maps to Stock Movement type, condition bucket, and
  idempotent movement evidence;
- replace `DefaultPaymentRefundCalculationService`,
  `DefaultPaymentRefundService`, or
  `DefaultPaymentProviderGatewayService.refund` in a customer module to connect
  custom refund rules, recovery retry/reconciliation, and real PSP refund
  behavior while preserving Payment-owned calculation and transaction evidence;
- replace checkout placement history or completion behavior by overriding the
  Workflow action handlers while preserving order history and placement-run
  evidence contracts;
- customize reverse checkout through `order.checkoutReverse` workflow,
  return-request, inventory-disposition, payment-refund, history, and
  compensation
  properties, or by replacing `DefaultCheckoutReverseWorkflowService` action
  handlers while preserving Fulfillment, Inventory, and Payment ownership
  boundaries;
- customize failure compensation through `order.checkoutPlacement.compensation`
  or by replacing `DefaultCheckoutPlacementCompensationService`, while keeping
  rollback/release/cancellation behavior in each owning module;
- add inventory promise types, states, payment requirements, or policy codes
  through `inventory.inventoryPromise`;
- change overbooking payment requirement through
  `inventory.inventoryPromise.overbookingPaymentRequirement`;
- add additional BackOffice/Axis navigation metadata through module-owned
  `backofficeCapabilities`.

Configuration should contain rules and values, not business logic. If logic is
needed, replace or extend the owning service from a customer module.

## 8. Customization patterns

### Add a new delivery group type

A customer module can layer configuration:

```js
module.exports = {
  cart: {
    checkoutAllocation: {
      policy: {
        deliveryGroupTypes: [
          "SHIP_TO_ADDRESS",
          "PICKUP_STORE",
          "INSTALLER_VISIT",
        ],
      },
    },
  },
};
```

The customer does not need to fork `cartDeliveryGroup`.

### Add a new inventory promise type

```js
module.exports = {
  inventory: {
    inventoryPromise: {
      promiseTypes: [
        "STOCK",
        "PRE_ORDER",
        "BACKORDER",
        "PERPETUAL",
        "DROP_SHIP",
        "MADE_TO_ORDER",
        "DIGITAL",
        "SUBSCRIPTION_ACCESS",
      ],
    },
  },
};
```

If `SUBSCRIPTION_ACCESS` needs special behavior, the customer module should
replace or decorate the promise policy/orchestration service. It should not
change framework source directly.

### Add project-specific validation

If a project needs stricter rules, replace the owning policy service in the
customer module. For example:

- Checkout placement sequencing belongs behind Workflow actions.
- Atomic placement-run evidence belongs behind `checkoutPlacementRunPipeline`.
- Cart-specific split validation belongs behind Cart checkout allocation policy
  service.
- Order-specific conversion validation belongs behind Order checkout allocation
  policy service.
- Order-side allocation copying belongs behind
  `DefaultCheckoutAllocationCopyService`, which freezes split evidence instead
  of recalculating it.
- Order-side placement completion belongs behind Workflow action handlers that
  record `orderHistoryEntry` and final `checkoutPlacementRun` evidence.
- Checkout placement compensation belongs behind owner-delegated Workflow
  action handlers; Order may request Inventory release but must not adjust
  Inventory counters directly.
- Reverse checkout flows belong behind Workflow action handlers; Order may
  coordinate return/refund steps, but Fulfillment owns return evidence and
  Payment owns refund transaction evidence.
- Reverse checkout recovery belongs behind owner-delegated Workflow
  compensation. Order may store `checkoutReverseRun` recovery strategy evidence,
  but Inventory, Fulfillment, and Payment must perform their own correction,
  retry, reconciliation, or adjustment operations.
- Operator recovery views should be composed from backend navigation metadata
  and reusable schema list/detail renderers. Reverse-run workspaces can show
  linked Order, Fulfillment return, Payment refund transaction, and Order
  history panels without creating a custom Axis-only recovery model.
- Promise capacity validation belongs behind Inventory promise policy or
  orchestration service.

### Customize tax-inclusive display without forking framework source

Suppose a customer operates in a market where product prices are normally
displayed tax-inclusive, but the invoice must still show tax. The smallest safe
customization is layered configuration plus, when required, a customer-owned Tax
adapter:

```js
module.exports = {
  pricing: {
    price: {
      defaultTaxInclusionMode: "TAX_INCLUSIVE",
    },
  },
  tax: {
    rate: {
      taxInclusionModes: ["TAX_EXCLUSIVE", "TAX_INCLUSIVE"],
    },
  },
  cart: {
    checkoutEntry: {
      policy: {
        taxInclusionModes: ["TAX_EXCLUSIVE", "TAX_INCLUSIVE"],
      },
    },
  },
  order: {
    checkoutEntry: {
      policy: {
        taxInclusionModes: ["TAX_EXCLUSIVE", "TAX_INCLUSIVE"],
      },
    },
  },
};
```

If the customer needs a different tax provider, replace or add the Tax provider
adapter service in the customer module. The adapter should return normalized
`taxQuote` and `taxQuoteLine` evidence with exact decimal strings. It should
not change Cart or Order source code, and it should not ask Axis to calculate
tax in the browser.

If the customer wants different Axis columns or detail grouping, layer
BackOffice navigation metadata in the owning module contribution:

```js
module.exports = {
  backofficeCapabilities: {
    order: {
      navigation: [
        {
          id: "order-entries",
          workbenchPresentation: {
            defaultColumns: [
              "entryCode",
              "itemCode",
              "lineGrossAmount",
              "taxTotal",
              "taxInclusionMode",
            ],
            detailSections: [
              {
                id: "customer-tax-display",
                label: "Customer tax display",
                fields: [
                  "lineNetAmount",
                  "lineGrossAmount",
                  "taxTotal",
                  "taxQuoteLineCode",
                ],
              },
            ],
          },
        },
      ],
    },
  },
};
```

The layered contribution changes presentation metadata. It does not create a
new renderer, duplicate the schema, or move tax rules into Axis.

## 9. Axis and business-user presentation

Axis should render checkout evidence from backend metadata and schema
definitions:

- list and table columns come from schema fields plus
  `workbenchPresentation.defaultColumns`;
- record detail panels use reusable schema detail renderers and
  `workbenchPresentation.detailSections`;
- help icons use module-owned `help.summary`;
- documentation icons use module-owned `help.documentationRoute` and optional
  `help.documentationFragment`;
- readonly evidence fields such as order-entry tax evidence should be shown as
  read-only even when a future edit workflow exists.

For tax-inclusive display, Axis should show:

- the customer-facing gross amount (`unitGrossAmount` or `lineGrossAmount`);
- the net amount when available;
- `taxTotal`;
- `taxInclusionMode`;
- whether tax is included (`taxIncluded`);
- links or related-detail panels to `taxQuote` and `taxQuoteLine` where the
  backend exposes those references.

Axis must not:

- calculate net/gross/tax splits in the browser;
- hide tax evidence just because the price is tax-inclusive;
- treat Cart and Order fields as separate UI-only models;
- hardcode columns that contradict backend schema or module presentation
  metadata.

## 10. Anti-patterns

Do not:

- add `deliveryAddress` or `paymentMethod` as one flat field on `cartEntry` for
  enterprise checkout;
- use JavaScript floating point numbers for quantity or money;
- mutate `stockBalance` from cart/order code;
- calculate payment inside inventory;
- make customer-specific framework edits when configuration or service override
  is enough;
- run order placement directly from a controller, frontend, or custom service
  while bypassing Workflow carrier state and the configured pipeline;
- duplicate cart/order/inventory models under customer modules just to add one
  field;
- hide business decisions in properties files as executable logic.
- hide applied tax when tax is included in price; store and display the split
  evidence instead.
- make Axis compute tax, recalculate historical order evidence, or bypass Tax
  quote evidence.

## 11. Verification commands

Use focused tests while developing:

```bash
node gComm/cart/test/cartCheckoutAllocationFoundationContract.test.js
node gComm/order/test/orderCheckoutAllocationFoundationContract.test.js
node gComm/order/test/checkoutPlacementWorkflowPipelineContract.test.js
node gComm/order/test/checkoutReverseWorkflowContract.test.js
node gComm/order/test/orderEntryFoundationContract.test.js
node gComm/tax/test/taxFoundationContract.test.js
node gComm/inventory/test/inventoryPromiseFoundation.test.js
node gComm/fulfillment/test/fulfillmentShipmentLifecycleContract.test.js
node gComm/test/commerceOperationsBackofficeNavigationContract.test.js
```

Refresh generated context after source changes:

```bash
npm run build
npm run llm:generate
npm run llm:validate
npm run test:generated-schema
```

## 12. Mental model

Think of checkout as a set of linked decisions:

1. Product decision: what item and quantity?
2. Delivery decision: where does each quantity go?
3. Payment decision: how is each quantity/amount paid?
4. Inventory promise decision: what capacity backs each quantity?
5. Order decision: what evidence is frozen at placement?
6. Fulfillment decision: which stock, serials, shipments, returns, or refunds
   happen later?

Nodics keeps these decisions separate because each one can change at enterprise
scale and each one belongs to a different authority.
