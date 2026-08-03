# Order Cancellation, Return, and Refund TODO

Nodics post-order lifecycle backlog @active @commerce @order @return @refund

Status: planning backlog only. This file is not runtime authority and must not be read by Nodics startup, loaders, pipelines, routers, or services.

Purpose:

  Build a careful, enterprise-grade implementation plan for order cancellation, return/RMA, refund approval, refund execution, stock reconciliation, fulfillment reversal, customer support operations, customer self-service, business approval, audit, and Axis lifecycle management.

  This process touches customers, customer support, order management, finance, warehouse operations, fulfillment partners, payment providers, tax, inventory, notifications, workflow, and audit. It must be implemented as small governed backend slices, then exposed in Axis through reusable backend-driven components.

Reference platforms reviewed:

  SAP Commerce / Hybris:
    - Supports full and partial cancellation/returns as explicit customer and support flows.
    - Separates cancellation before fulfillment from return after receipt.
    - Backoffice/customer support roles participate in refund and return processing.
    - Return integration can interact continuously with backend ERP/order systems.

  Oracle Commerce:
    - Return processing starts from an order, selects return items and quantities, and generates return requests.
    - Multiple-payment return handling allows refund amounts to be adjusted across payment types.
    - RMA-style thinking separates the return request from payment/refund and inventory/receipt outcomes.

  BigCommerce:
    - Refund APIs are exposed against orders with settled payments.
    - Refunds can be embedded into order-management/payment integrations.
    - Return-request workflow is not as complete as refund API behavior and often requires app/workflow logic.

  Liferay Commerce:
    - Returns are modeled as explicit return requests and return items.
    - Return items have authorization workflow states.
    - Order management separates payment/refund history and shipment history.

Nodics design principles:

  ☐ Treat cancellation, return, and refund as a post-order lifecycle capability, not as simple Order CRUD. @principle
  ☐ Order owns order header, order entries, order groups, order allocation references, lifecycle state, and order history. @principle
  ☐ Payment owns void, refund, settlement, transaction, provider evidence, retry policy, reconciliation, and provider execution. @principle
  ☐ Refund must default to the original payment method and original payment provider that captured or settled the money. Any alternative refund destination, such as wallet, store credit, bank transfer, voucher, or manual refund, must be policy-approved, audited, and visible as an exception. @principle @payment @refund @security
  ☐ Inventory owns stock release, reservation cancellation, allocation cancellation, returned-stock receipt, inspection stock, scrap stock, resaleable stock, and stock movement evidence. @principle
  ☐ Fulfillment owns shipment cancellation, return shipment, pickup, carrier labels, consignment reversal, and return-delivery evidence. @principle
  ☐ Workflow owns long-running approval and cross-team business processes: refund approval, return authorization, exception review, manual override, provider retry handoff, and escalation. @principle
  ☐ Pipelines divide one technical operation into replaceable steps: validate request, calculate eligibility, calculate amount, persist request, call owning services, normalize evidence, publish events. @principle
  ☐ Axis must never coordinate unsafe multi-request transactions across Order, Payment, Inventory, Fulfillment, Tax, Notification, or Workflow. @principle @axis
  ☐ Axis must manage rules, approval queues, business operations, and lifecycle visibility through backend-owned contracts and reusable renderers. @principle @axis
  ☐ Customer self-service, customer support, finance approval, warehouse approval, and business manager approval must be modeled as different roles/scopes, not as hardcoded shortcuts. @principle @security
  ☐ Every decision must preserve tenant, enterprise, site, channel, customer, currency, locale, country, and permission context. @principle @security
  ☐ Refund and return operations must be idempotent, auditable, retry-safe, and safe against duplicate provider calls. @principle @security
  ☐ Cancellation and return eligibility must understand every supported item/inventory type: serialized physical items, non-serialized physical items, digital items, perpetual/infinite-inventory items, subscriptions/services, SIM/eSIM/license-like products, pre-order, backorder, drop-ship, and made-to-order items. @principle @inventory @product
  ☐ Customer/support cancellation can target partial inventory quantities, not only whole order entries. A quantity `3` line may cancel `1`, `2`, or specific serialized units while the remaining quantity continues through fulfillment. @principle @inventory @order
  ☐ No raw payment-provider payloads, card data, carrier credentials, internal warehouse paths, or customer secrets may be stored in business records. @principle @security
  ☐ All commercial values must use validated exact money/quantity representations, never JavaScript floating point. @principle
  ☐ Customer/project modules must customize policy by layering configuration, replacing services/pipeline nodes, adding workflow definitions, or adding provider adapters; they must not fork framework modules. @principle @customization

Actors and responsibilities:

  Customer:
    ☐ Can request cancellation for eligible unfulfilled order quantities. @actor @customer
    ☐ Can request return for eligible fulfilled/delivered order quantities. @actor @customer
    ☐ Can provide return reason, comments, images/proof, preferred pickup/drop-off option, and preferred refund mode when allowed. @actor @customer
    ☐ Can see status, requested quantities, approved quantities, rejected quantities, refund status, expected timelines, and messages. @actor @customer
    ☐ Cannot approve their own refund or bypass policy checks. @actor @security

  Customer support:
    ☐ Can create cancellation/return/refund requests on behalf of customers with reason and audit evidence. @actor @support
    ☐ Can inspect order, shipment, payment, return, and refund history from authorized scope. @actor @support
    ☐ Can recommend approval or rejection based on policy and evidence. @actor @support
    ☐ Cannot execute payment-provider refunds directly unless policy grants that operation and approval is complete. @actor @security

  Business approver:
    ☐ Can approve, reject, request more information, or escalate refund/return/cancellation requests. @actor @approver
    ☐ Approval authority must be configurable by tenant, enterprise, channel, country, amount threshold, payment method, return reason, product type, customer segment, and risk score. @actor @approver
    ☐ Approval actions must bind to immutable submitted request/version evidence. @actor @security

  Finance/operator:
    ☐ Can review refund execution, settlement status, reconciliation status, failed provider calls, and manual adjustment needs. @actor @finance
    ☐ Can trigger governed retry/reconciliation where policy allows. @actor @finance
    ☐ Cannot change customer/order facts directly; corrections must create adjustment evidence. @actor @security

  Warehouse/fulfillment operator:
    ☐ Can inspect return authorization, receive returned goods, record condition/disposition, and trigger stock movement through Inventory-owned services. @actor @warehouse
    ☐ Can record package received, missing, damaged, resaleable, scrap, inspection, or return-to-vendor outcomes. @actor @warehouse

  System/workflow:
    ☐ Runs eligibility checks, approval routing, timeout/escalation, provider execution, notifications, reconciliation, and lifecycle state transitions. @actor @workflow

Business scenarios:

  Full order cancellation before fulfillment:
    ☐ Customer or support requests cancellation for all open quantities. @scenario
    ☐ System validates order state, payment state, fulfillment state, inventory reservation state, cancellation window, product restrictions, and fraud/risk flags. @scenario
    ☐ Payment is voided if authorized but not captured. @scenario
    ☐ Payment refund is requested if captured and policy allows cancellation refund. @scenario
    ☐ Inventory reservations/allocations are released by Inventory. @scenario
    ☐ Fulfillment release is cancelled by Fulfillment when shipment/consignment is not dispatched. @scenario
    ☐ Order status moves to cancelled only when all cancellable quantities are resolved. @scenario

  Partial order cancellation before fulfillment:
    ☐ Customer/support can select specific entries and quantities. @scenario
    ☐ Quantity-level cancellation must work for quantity `3` where `1` is cancelled and `2` remain active. @scenario
    ☐ Partial inventory cancellation must work even when the order entry points to multiple inventory promises, reservations, delivery allocations, payment allocations, or serial numbers. @scenario @inventory
    ☐ Delivery allocations and payment allocations must be recalculated or adjusted without losing original checkout evidence. @scenario
    ☐ Remaining quantities stay fulfillable and payable according to original order lifecycle. @scenario

  Line-level cancellation:
    ☐ Entire order entry can be cancelled without cancelling sibling entries. @scenario
    ☐ Entry-level tax, discount, delivery-charge, payment allocation, inventory allocation, and fulfillment state must be evaluated. @scenario

  Serialized cancellation:
    ☐ Cancellation can target specific serial numbers when serialized stock units are allocated. @scenario
    ☐ Cancellation must not release or refund a serial number already shipped, returned, replaced, or scrapped. @scenario
    ☐ Serialized cancellation must preserve serial-number evidence from reservation/allocation through cancellation, stock release, refund calculation, audit, and customer/support visibility. @scenario @inventory @audit

  Non-serialized physical-item cancellation:
    ☐ Cancellation can target quantity without serial numbers, for example cancelling `2` of `5` generic stock units. @scenario
    ☐ Inventory release must reduce reservation/allocation quantities exactly and preserve warehouse/promise evidence through Inventory-owned services. @scenario @inventory
    ☐ Refund calculation must use the cancelled quantity's proportional entry price, tax, discount, shipping, and payment allocation evidence. @scenario @refund

  Return after delivery:
    ☐ Customer/support can request return only for eligible fulfilled/delivered quantities. @scenario
    ☐ Return request records selected entry, quantity, optional serial number, reason, condition, proof, and desired outcome. @scenario
    ☐ Return authorization may approve all, approve partial, reject all, request more proof, or escalate. @scenario
    ☐ Return receipt may produce resaleable stock, inspection stock, scrap stock, repair flow, replacement flow, or return-to-vendor flow. @scenario

  Partial return after delivery:
    ☐ Customer can return one quantity out of many quantities for the same order entry. @scenario
    ☐ Return/refund amount must respect original price, tax, discount, delivery charge, payment split, and return policy. @scenario

  Refund without physical return:
    ☐ Support/business may approve goodwill, damaged-in-transit, missing-item, service-credit, or correction refund without returned stock. @scenario
    ☐ Inventory movement must not happen unless a physical stock event exists. @scenario

  Return without refund:
    ☐ Business may accept a no-refund return for warranty, exchange-only, unpaid COD, already-refunded, or policy-excluded cases. @scenario
    ☐ Return status and refund status must remain separate. @scenario

  Exchange/replacement:
    ☐ Decide whether initial implementation supports replacement/exchange or defers it behind return authorization evidence. @scenario @decision
    ☐ If deferred, model enough return reason/outcome evidence so exchange can be added later without data migration. @scenario

  Multi-payment refund:
    ☐ Refund must handle order quantities paid through card, wallet, COD, advance, store credit, bank transfer, account credit, offline, or mixed methods. @scenario
    ☐ Refund routing must preserve original payment allocation and original provider execution path by default. @scenario
    ☐ If a card payment was captured through CyberSource, Stripe, PayPal, Visa, or another configured provider, the refund must be routed back through that same provider unless an explicit governed exception allows a different route. @scenario @payment @provider
    ☐ If an order was split across multiple methods/providers, refund allocation must split back across those same original methods/providers in proportion to the refundable amount or according to configured original-allocation evidence. @scenario @payment
    ☐ Alternative refund destinations are exceptions, not defaults, and require policy reason, approval evidence, customer communication where applicable, and audit. @scenario @security
    ☐ Refund should support partial refund by method, e.g. card amount to card and wallet amount to wallet. @scenario
    ☐ COD return may require wallet/store-credit/manual refund instead of provider refund. @scenario

  Shipping and delivery refund:
    ☐ Policy must decide when shipping charge is refundable. @scenario
    ☐ Partial return may refund no shipping, proportional shipping, full shipping, or fixed shipping amount based on policy. @scenario

  Tax refund:
    ☐ Tax refund must be calculated from original tax evidence and country/jurisdiction policy. @scenario
    ☐ Inclusive-tax and exclusive-tax prices must both show refund tax evidence where business/customer UI requires it. @scenario

  Promotion/discount impact:
    ☐ Refund amount must respect promotions/discounts applied at entry and order level. @scenario
    ☐ Decide whether partial return can claw back bundle/order discounts when remaining order no longer qualifies. @scenario @decision
    ☐ Do not implement promotion refund logic inside Order; delegate to Promotion/Calculation policy where applicable. @scenario

  Digital/perpetual goods:
    ☐ Define policy for cancelling/returning digital, perpetual, subscription, license, SIM/eSIM, or service products. @scenario
    ☐ Some products may be non-returnable after activation or may require provider deactivation before refund. @scenario
    ☐ Digital cancellation must distinguish not-yet-delivered digital entitlement, delivered-but-not-activated entitlement, activated entitlement, expired entitlement, and revoked entitlement. @scenario @digital
    ☐ Perpetual/infinite-inventory items must not attempt physical stock release, but may require entitlement revocation, service-provider cancellation, license deactivation, SIM/eSIM deprovisioning, or subscription cancellation. @scenario @digital @inventory
    ☐ Digital refunds must still route to the original payment method/provider by default and must include entitlement/provider deactivation evidence where policy requires it. @scenario @digital @refund

  Fraud/risk exception:
    ☐ Suspicious refund patterns may require extra approval or deny automatic approval. @scenario
    ☐ Fraud evidence must be safe, normalized, and permission-filtered. @scenario

Phase 0 — Current implementation and gap analysis:

  ☐ Review current Order schemas, services, pipelines, workflow hooks, checkout placement, order history, and order calculation lifecycle. @phase0 @analysis
  ☐ Review current Cart allocation, Order allocation copy, Payment authorization/refund services, Inventory reservation/allocation services, Fulfillment release/cancellation services, Tax calculation, Promotion calculation, Notification capability, Workflow engine, and Axis metadata. @phase0 @analysis
  ☐ Identify any existing compensation/cancellation utilities so new work extends existing owners instead of creating parallel paths. @phase0 @analysis
  ☐ Document verified current contracts versus missing behavior before writing source code. @phase0 @analysis
  ☐ Complete an architectural compliance review before source implementation starts. Confirm module ownership, group-module composition boundaries, service/pipeline/workflow placement, configuration-first extension, reusable Axis renderers, and no duplicate parallel implementation path. @phase0 @architecture @governance
  ☐ Complete a security governance review before source implementation starts. Confirm tenant/enterprise/customer scope, role separation, maker-checker approval, idempotency, audit, provider evidence redaction, safe errors, rate limits, and original-payment-provider refund enforcement. @phase0 @security @governance
  ☐ Complete a low-level beginner documentation outline before source implementation starts. Confirm that cancellation, return, RMA, refund, payment void, settlement, stock release, returned-stock disposition, workflow approval, provider refund, and customer/support/finance/warehouse journeys will be explained with examples. @phase0 @docs

Architectural compliance review checklist:

  ☐ Verify cancellation, return, refund, exchange, and adjustment are treated as post-order lifecycle capabilities, not plain Order CRUD. @architecture
  ☐ Verify Order owns the business request/lifecycle, Payment owns provider refund/void/settlement execution, Inventory owns stock movements, Fulfillment owns shipment/return logistics, Tax owns tax evidence, Promotion owns discount impact, Workflow owns approvals, and Axis owns presentation only. @architecture @boundary
  ☐ Verify every model, service, controller, router, pipeline, workflow action, test, AGENTS.md, README.md, and LLM contract is placed in the owning module after the `gComm` hierarchy cleanup. @architecture @module-placement
  ☐ Verify group modules remain composition-only and do not collect business logic directly. @architecture
  ☐ Verify technical operations are decomposed into replaceable Pipeline steps and long-running approval/provider processes are Workflow-driven. @architecture @pipeline @workflow
  ☐ Verify customer modules can customize policies, validators, pipeline nodes, workflow definitions, providers, reason codes, and Axis metadata without forking framework modules. @architecture @customization
  ☐ Verify properties files contain configuration only and service/business logic lives in services, utils, adapters, policies, pipelines, or workflow nodes. @architecture @configuration
  ☐ Verify reusable Axis components are used for schema grid/list, schema detail, reference detail, query builder, grid settings, export, sorting, pagination, media preview, action bars, info icons, and documentation icons. @architecture @axis
  ☐ Verify framework documentation anchors exist for every Axis documentation icon before the page is considered complete. @architecture @docs

Security governance review checklist:

  ☐ Verify all lifecycle operations enforce tenant, enterprise, site, channel, customer, order, role, permission, and operation scope. @security
  ☐ Verify customer self-service can access only the customer's own eligible orders and requests. @security
  ☐ Verify support, approver, finance, warehouse, and administrator roles are separated and policy-controlled. @security
  ☐ Verify the same principal cannot request and approve high-risk refunds when maker-checker is required. @security
  ☐ Verify refund execution is idempotent and cannot double-refund, double-void, double-release stock, double-cancel shipment, or double-close a workflow task. @security @idempotency
  ☐ Verify refunds go back to the original payment method and original provider by default; alternate refund destinations require explicit policy, approval, reason, customer communication where applicable, and audit. @security @payment
  ☐ Verify raw payment-provider payloads, card data, carrier secrets, warehouse internals, customer secrets, and unnecessary PII are never exposed to Axis or casual logs. @security @redaction
  ☐ Verify every decision, approval, rejection, override, provider call, retry, reconciliation, stock movement, shipment event, notification, and manual adjustment emits append-only audit evidence. @security @audit
  ☐ Verify stale request versions, stale approval evidence, replayed webhooks, duplicate submissions, and unauthorized retries are rejected safely. @security
  ☐ Verify client-visible errors are sanitized and operational diagnostics remain permission-filtered. @security

Phase 1 — Domain model design:

  ☐ Decide whether cancellation, return, and refund models belong entirely under Order or whether Refund record authority belongs under Payment while Order owns the business request. @phase1 @decision
  ☐ Define `orderCancellationRequest` model. @phase1 @schema
  ☐ Define `orderCancellationEntry` or `orderCancellationAllocation` model for line/quantity/serial-level cancellation. @phase1 @schema
  ☐ Ensure cancellation allocation supports serialized units, non-serialized quantity, digital entitlement reference, perpetual inventory reference, reservation reference, allocation reference, delivery allocation reference, and payment allocation reference. @phase1 @schema @inventory
  ☐ Define `returnRequest` model. @phase1 @schema
  ☐ Define `returnItem` model for entry/quantity/serial-level return authorization and receipt. @phase1 @schema
  ☐ Define `refundRequest` model for business refund intent and approval lifecycle. @phase1 @schema
  ☐ Define `refundAllocation` model for payment-method/provider/amount/tax/shipping-level refund distribution. @phase1 @schema
  ☐ Define `refundTransaction` ownership boundary: Payment-owned provider transaction evidence or Order-visible projection. @phase1 @schema
  ☐ Define `orderLifecycleEvent` or extend order history for immutable events across cancellation, return, refund, stock, fulfillment, notification, and workflow decisions. @phase1 @schema
  ☐ Define reason-code schemas or configuration for cancellation reasons, return reasons, refund reasons, rejection reasons, and disposition codes. @phase1 @schema
  ☐ Define status enums/configuration for request header and item-level states. @phase1 @schema

Phase 2 — Lifecycle state model:

  ☐ Define order-level states: placed, confirmed, partially cancellable, cancellation requested, partially cancelled, cancelled, fulfilment in progress, shipped, delivered, return requested, partially returned, returned, refund pending, partially refunded, refunded, closed, exception. @phase2 @lifecycle
  ☐ Define cancellation request states: draft, submitted, validating, pending approval, approved, rejected, executing, partially completed, completed, failed, cancelled, expired. @phase2 @lifecycle
  ☐ Define return request states: draft, submitted, pending authorization, authorized, partially authorized, rejected, awaiting shipment, in transit, received, inspection, dispositioned, completed, failed, cancelled, expired. @phase2 @lifecycle
  ☐ Define return item states: awaiting authorization, authorized, rejected, shipped, received, accepted, inspection, resaleable, repair, scrap, return to vendor, replacement pending, completed. @phase2 @lifecycle
  ☐ Define refund request states: draft, submitted, rule-approved, pending human approval, approved, rejected, executing, provider pending, partially refunded, refunded, failed, reconciliation required, cancelled. @phase2 @lifecycle
  ☐ Define refund allocation/transaction states: planned, authorized for execution, sent to provider, accepted, settled, failed, retry scheduled, reconciled, manually adjusted. @phase2 @lifecycle
  ☐ Define allowed transitions and immutable terminal states. @phase2 @lifecycle

Phase 3 — Eligibility and policy:

  ☐ Define cancellation window policy by tenant, enterprise, site, channel, product type, order state, fulfillment state, and payment state. @phase3 @policy
  ☐ Define return window policy by product, category, condition, country, customer segment, delivery date, warranty, and channel. @phase3 @policy
  ☐ Define refundable amount policy: full amount, item-only, tax-only, shipping, restocking fee, goodwill credit, manual adjustment. @phase3 @policy
  ☐ Define non-returnable and non-refundable product policy. @phase3 @policy
  ☐ Define quantity eligibility policy for remaining cancellable/returnable/refundable quantity. @phase3 @policy
  ☐ Define serialized-item eligibility policy. @phase3 @policy
  ☐ Define non-serialized quantity eligibility policy. @phase3 @policy
  ☐ Define digital/perpetual/service-item cancellation and refund eligibility policy. @phase3 @policy
  ☐ Define multi-payment refund distribution policy. @phase3 @policy
  ☐ Define original-payment-method/provider refund policy and explicit exception policy for alternate refund destination. @phase3 @policy @payment
  ☐ Define auto-approval policy by amount threshold, reason, customer trust level, product type, provider risk, and historical returns. @phase3 @policy
  ☐ Define human approval escalation policy by amount, role, department, enterprise, country, payment method, and risk. @phase3 @policy
  ☐ Define evidence requirements such as images, package condition, carrier tracking, item serial number, invoice, or support note. @phase3 @policy
  ☐ Define timeout, expiry, SLA, escalation, and abandoned request behavior. @phase3 @policy

Phase 4 — Workflow design:

  ☐ Define cancellation workflow: submit request, validate eligibility, route approval if required, execute payment/fulfillment/inventory changes, notify customer/support, close request. @phase4 @workflow
  ☐ Define return authorization workflow: submit return, validate returnability, route approval, authorize return items, generate return instructions, receive goods, inspect/disposition, trigger refund or close. @phase4 @workflow
  ☐ Define refund approval workflow: submit refund, calculate refund plan, rule-check, human approval if required, execute provider refund, reconcile, notify, close. @phase4 @workflow
  ☐ Define exception workflow for provider failure, missing returned item, damaged item, fraud review, over-refund risk, and manual correction. @phase4 @workflow
  ☐ Ensure all human workflow actions use authorized tasks, scoped permissions, immutable submitted evidence, and audit. @phase4 @security
  ☐ Ensure workflow callbacks call Order/Payment/Inventory/Fulfillment APIs instead of mutating records directly. @phase4 @boundary

Phase 5 — Pipeline design:

  ☐ Define `orderCancellationValidationPipeline`. @phase5 @pipeline
  ☐ Define `orderCancellationCalculationPipeline` for cancellable quantity and amount evidence. @phase5 @pipeline
  ☐ Define `orderCancellationExecutionPipeline` for technical execution after approval. @phase5 @pipeline
  ☐ Define `returnRequestValidationPipeline`. @phase5 @pipeline
  ☐ Define `returnAuthorizationPipeline`. @phase5 @pipeline
  ☐ Define `returnReceiptDispositionPipeline`. @phase5 @pipeline
  ☐ Define `refundCalculationPipeline`. @phase5 @pipeline
  ☐ Define `refundApprovalPreparationPipeline`. @phase5 @pipeline
  ☐ Define `refundExecutionPipeline`. @phase5 @pipeline
  ☐ Ensure pipeline nodes are small, named, replaceable, and call owning modules for authority. @phase5 @pipeline

Phase 6 — Cross-module contracts:

  ☐ Order to Payment: request void/refund execution with idempotency key, approved amount, currency, method allocation, provider hints, and audit context. @phase6 @payment
  ☐ Order to Payment: include original payment method code, original provider code, original transaction reference, capture/settlement reference, and refund-allocation evidence so Payment can route refund back to the original payment rail by default. @phase6 @payment @refund
  ☐ Payment to Order: return normalized refund transaction evidence, provider status, retry/reconciliation state, and safe error codes. @phase6 @payment
  ☐ Order to Inventory: cancel reservation/allocation, release stock, receive returned stock, record disposition, and update promise/reservation evidence. @phase6 @inventory
  ☐ Inventory to Order: return normalized movement/reservation evidence without raw warehouse internals. @phase6 @inventory
  ☐ Order to Fulfillment: cancel release, cancel consignment, create return pickup/drop-off request, record return tracking. @phase6 @fulfillment
  ☐ Fulfillment to Order: return normalized carrier/consignment evidence without secrets/raw provider payloads. @phase6 @fulfillment
  ☐ Order to Tax: calculate tax refund evidence using original tax evidence and refund policy. @phase6 @tax
  ☐ Order to Promotion: calculate refund impact of entry/order-level discounts without copying Promotion logic into Order. @phase6 @promotion
  ☐ Order to Notification: publish customer/support/approver notifications through owning notification/event contracts. @phase6 @notification
  ☐ Order to Workflow: submit and update process instances and human tasks through Workflow-owned APIs. @phase6 @workflow

Phase 7 — Security and governance:

  ☐ Define permissions for customer self-service cancellation, customer self-service return, support create-on-behalf, support read, support recommend, approver approve/reject, finance execute/retry, warehouse receive/disposition, admin configure policy. @phase7 @security
  ☐ Define scope model by tenant, enterprise, site, channel, customer, order, department, role, and operation. @phase7 @security
  ☐ Enforce that customer can access only own orders/requests. @phase7 @security
  ☐ Enforce customer-support access by assigned enterprise/site/channel/customer scope. @phase7 @security
  ☐ Enforce finance/refund execution separation of duties where configured. @phase7 @security
  ☐ Prevent same principal from both requesting and approving high-risk refunds where policy requires separation. @phase7 @security
  ☐ Enforce immutable approval evidence and stale-version rejection. @phase7 @security
  ☐ Sanitize all client-visible errors and provider evidence. @phase7 @security
  ☐ Add audit events for request creation, policy decision, approval, rejection, execution, provider result, stock movement, fulfillment event, notification, and manual override. @phase7 @audit
  ☐ Add idempotency and duplicate-submit protection for all execution APIs. @phase7 @security
  ☐ Add abuse/rate-limit policy for customer self-service requests. @phase7 @security

Phase 8 — Axis business operations:

  ☐ Add backend-driven Axis navigation metadata for Order Cancellations, Returns, Refunds, Return Reasons, Refund Rules, Approval Queues, and Exceptions. @phase8 @axis
  ☐ Use reusable schema grid/list renderer for requests and histories. @phase8 @axis
  ☐ Use reusable schema detail renderer for request detail, item detail, payment/refund evidence, fulfillment evidence, inventory evidence, and workflow tasks. @phase8 @axis
  ☐ Use reusable relationship/reference renderer so order, customer, payment, shipment, stock, and workflow references are clickable without page navigation loss. @phase8 @axis
  ☐ Add customer-support workbench view: search order, inspect customer/order context, create cancellation/return/refund request on behalf of customer. @phase8 @axis
  ☐ Add approver queue view: pending approvals, risk indicators, evidence, policy explanation, approve/reject/request-info actions. @phase8 @axis
  ☐ Add finance queue view: approved refunds, provider execution state, failed/retry/reconciliation actions. @phase8 @axis
  ☐ Add warehouse/returns queue view: expected returns, received items, condition/disposition capture, stock outcome. @phase8 @axis
  ☐ Add policy configuration screens for return windows, cancellation windows, refund thresholds, reason codes, auto-approval, evidence requirements, and role assignments. @phase8 @axis
  ☐ Add documentation icons and info icons backed by framework documentation anchors, not Axis-only docs unless the concept is Axis-specific. @phase8 @axis
  ☐ Do not create page-specific duplicate grids/details/query builders/actions if reusable Axis renderers already exist. @phase8 @axis

Phase 9 — API and event contracts:

  ☐ Define customer-facing API contracts for request cancellation, request return, upload proof/reference media, view status, cancel draft request, and provide more information. @phase9 @api
  ☐ Define support-facing API contracts for create-on-behalf, update evidence, recommend decision, and message customer. @phase9 @api
  ☐ Define approver API contracts for approve, reject, request information, escalate, delegate, and takeover where allowed. @phase9 @api
  ☐ Define finance API contracts for execute refund, retry refund, reconcile refund, manual adjustment, and close exception. @phase9 @api
  ☐ Define warehouse API contracts for receive return, inspect, disposition, and stock outcome. @phase9 @api
  ☐ Define event contracts for cancellation requested/approved/executed, return requested/authorized/received/dispositioned, refund requested/approved/executed/failed/reconciled. @phase9 @event

Phase 10 — Observability and operations:

  ☐ Add correlation across order, cancellation, return, refund, payment, inventory, fulfillment, workflow, notification, and provider calls. @phase10 @observability
  ☐ Add metrics for request volume, approval SLA, refund amount, failure rate, provider latency, retry count, return reason, rejection reason, stock disposition, and customer/support workload. @phase10 @observability
  ☐ Add diagnostics for stuck workflows, failed provider refunds, unreceived returns, inconsistent stock movement, over-refund risk, and orphaned requests. @phase10 @operations
  ☐ Add repair/reconciliation jobs through CronJob/Workflow where long-running recovery is required. @phase10 @operations

Phase 11 — Tests and verification:

  ☐ Test full cancellation before fulfillment with payment void and stock release. @phase11 @test
  ☐ Test full cancellation after capture with refund approval and provider refund. @phase11 @test
  ☐ Test partial cancellation of quantity `1` from quantity `3`. @phase11 @test
  ☐ Test customer/support cancellation of partial inventory where one order entry has multiple inventory reservation/allocation references. @phase11 @test @inventory
  ☐ Test partial cancellation where one quantity has already shipped and cannot be cancelled. @phase11 @test
  ☐ Test serialized cancellation by serial number. @phase11 @test
  ☐ Test non-serialized cancellation by quantity without serial numbers. @phase11 @test
  ☐ Test digital/perpetual-item cancellation where no physical stock release occurs but entitlement/provider deactivation evidence is required. @phase11 @test
  ☐ Test return request for delivered order and quantity-level partial return. @phase11 @test
  ☐ Test return authorization requiring human approval. @phase11 @test
  ☐ Test return rejection and customer/support visibility. @phase11 @test
  ☐ Test returned-stock receipt into resaleable, inspection, and scrap outcomes. @phase11 @test
  ☐ Test refund approval workflow with auto approval below threshold and human approval above threshold. @phase11 @test
  ☐ Test multi-payment refund allocation across card and wallet/COD/store credit. @phase11 @test
  ☐ Test refund returns to original payment method and provider by default. @phase11 @test @payment
  ☐ Test alternate refund destination requires policy approval and audit evidence. @phase11 @security-test @payment
  ☐ Test tax refund for inclusive and exclusive tax pricing. @phase11 @test
  ☐ Test shipping refund policy variants. @phase11 @test
  ☐ Test provider refund failure, retry, reconciliation, and safe client error. @phase11 @test
  ☐ Test customer cannot approve own refund. @phase11 @security-test
  ☐ Test support cannot access another enterprise/customer order outside scope. @phase11 @security-test
  ☐ Test stale approval version is rejected. @phase11 @security-test
  ☐ Test duplicate execution/idempotency does not double refund or double release stock. @phase11 @security-test
  ☐ Test Axis metadata exposes only authorized actions by role/scope. @phase11 @axis-test

Phase 12 — Documentation:

  ☐ Add beginner-level explanation of cancellation, return, RMA, refund, void, settlement, approval, stock disposition, and reconciliation. @phase12 @docs
  ☐ Add business-user guide for customers, customer support, approvers, finance, and warehouse users. @phase12 @docs
  ☐ Add administrator guide for configuring policies, reason codes, approval thresholds, roles, scopes, and notifications. @phase12 @docs
  ☐ Add developer guide for schemas, services, pipelines, workflows, APIs, events, extension points, tests, and customization. @phase12 @docs
  ☐ Add AI-tool guidance explaining module boundaries and prohibited shortcuts. @phase12 @docs
  ☐ Add examples for customer module customization: return window override, refund threshold override, custom approver routing, custom provider refund adapter, custom return disposition, and custom notification. @phase12 @docs
  ☐ Add low-level worked examples for full cancellation, partial cancellation, serialized cancellation, non-serialized quantity cancellation, digital entitlement cancellation, full return, partial return, refund without return, return without refund, multi-payment refund, tax refund, shipping refund, and provider failure/retry. @phase12 @docs
  ☐ Add beginner diagrams showing how Order, Payment, Inventory, Fulfillment, Tax, Promotion, Workflow, Notification, and Axis cooperate without crossing ownership boundaries. @phase12 @docs @architecture
  ☐ Add a security-governance guide explaining scopes, roles, maker-checker approval, original-payment-provider refunds, idempotency, audit evidence, safe errors, and redaction in beginner language. @phase12 @docs @security
  ☐ Add architecture-compliance guidance that tells future developers and AI tools where each file belongs, which services own which decisions, and which shortcuts are forbidden. @phase12 @docs @architecture
  ☐ Promote only verified implementation behavior into canonical documentation content pack. @phase12 @docs

Implementation sequence recommendation:

  1. Review current implementation and confirm model ownership. @sequence
  2. Add reason/status/policy foundations with tests. @sequence
  3. Add cancellation request and cancellation calculation/validation pipelines. @sequence
  4. Add cancellation workflow and execution pipeline. @sequence
  5. Add return request and return item authorization models. @sequence
  6. Add return authorization workflow and receipt/disposition pipeline. @sequence
  7. Add refund request/allocation model and refund calculation pipeline. @sequence
  8. Add refund approval workflow. @sequence
  9. Add Payment-owned refund execution/reconciliation bridge. @sequence
  10. Add Axis lifecycle and policy screens through reusable renderers. @sequence
  11. Add full documentation and generated context validation. @sequence

Open decisions:

  ☐ Should refund request records live under Order, Payment, or split as Order-owned business request plus Payment-owned execution transaction? @decision
  ☐ Should return request records live under Order or a dedicated Returns module under `gComm`? @decision
  ☐ Should cancellation/return/refund be grouped into a dedicated `gComm/returns` or `gComm/orderLifecycle` module later, or remain initially under Order with owned cross-module delegation? @decision
  ☐ Should exchange/replacement be included in first implementation or deferred after return/refund foundation? @decision
  ☐ Should customer-facing self-service APIs be implemented now or only backend/Axis support operations first? @decision
  ☐ What is the first payment provider/method that must support real refund execution beyond mocked adapter contracts? @decision
  ☐ What return logistics provider should be modeled first for pickup/drop-off labels? @decision

Pre-cancellation prerequisites and adjacent decisions:

  These items must be reviewed before implementation starts so cancellation,
  return, and refund work does not hide broader checkout/order gaps inside the
  reverse-order lifecycle. They do not all need to be fully implemented first,
  but each must have a clear design decision, deferral note, or integration
  boundary before the first source-code slice begins.

  Quotes and assisted sales:
    ☐ Decide whether Quote and Quote Entry are required before cancellation/refund implementation or can remain a later B2B/assisted-sales workstream. @precondition @quote @commerce
    ☐ If deferred, document how future Quote-to-Cart and Quote-to-Order conversion will preserve cancellation, return, refund, approval, price, tax, promotion, delivery, and payment evidence. @precondition @quote @order
    ☐ Ensure cancellation/refund models do not assume every order started as a normal storefront cart; orders may later originate from quote, assisted sales, subscription, import, marketplace, customer-support adjustment, or external order capture. @precondition @quote @order
    ☐ Define whether quote-originated orders require different cancellation windows, approval thresholds, refund rules, or sales-representative notification. @precondition @quote @policy

  Fraud and risk:
    ☐ Decide whether fraud/risk remains normalized external-provider evidence or becomes a first-class Commerce capability before refund approval is implemented. @precondition @fraud @risk
    ☐ If fraud is deferred, define the minimum safe fraud/risk evidence contract that refund approval can consume without depending on a future fraud module. @precondition @fraud @security
    ☐ Ensure cancellation/return/refund policy can consider risk signals such as high refund amount, repeated returns, unusual payment method, mismatched delivery address, chargeback history, suspicious customer account, or provider risk response. @precondition @fraud @policy
    ☐ Ensure risk evidence is permission-filtered in Axis and never exposes raw third-party fraud-provider payloads to unauthorized users. @precondition @fraud @axis @security

  Exchange and replacement posture:
    ☐ Decide whether exchange/replacement is in the first delivery scope or explicitly deferred. @precondition @exchange
    ☐ If deferred, model return reason, requested outcome, item condition, disposition, replacement eligibility, and original-order references so exchange can be added without data migration. @precondition @exchange @schema
    ☐ Ensure return without refund, refund without return, replacement without refund, and replacement with price difference can be represented as future lifecycle extensions. @precondition @exchange @refund

  Axis lifecycle readiness:
    ☐ Confirm reusable Axis schema grid/list, detail renderer, reference detail, query builder, grid settings, export, sorting, pagination, help icon, and documentation icon components are ready for cancellation/return/refund screens. @precondition @axis
    ☐ Confirm Axis can render task-focused workspaces rather than generic CRUD clones: customer-support workbench, approval queue, finance refund queue, warehouse return queue, policy configuration, exception/reconciliation queue, and order lifecycle detail. @precondition @axis
    ☐ Confirm Axis action metadata can hide, disable, or expose cancellation, return, approval, refund execution, retry, reconciliation, receipt, and disposition actions by role, scope, lifecycle state, and policy result. @precondition @axis @security
    ☐ Confirm Axis documentation links for cancellation, return, refund, RMA, void, settlement, stock disposition, and approval point to framework documentation anchors. @precondition @axis @docs

  Checkout/order foundation verification:
    ☐ Re-run or review current cart/order/checkout contract tests before coding cancellation so we know the foundation still passes. @precondition @test
    ☐ Verify cart/order entry, delivery allocation, payment allocation, inventory reservation, payment authorization, fulfillment release, tax evidence, promotion evidence, order history, and calculation pipelines are still the authoritative extension points. @precondition @checkout @governance
    ☐ Verify order calculation only recalculates through governed lifecycle operations such as amendment, return, refund, adjustment, or reconciliation. @precondition @order @calculation
    ☐ Verify no Axis or client path coordinates direct multi-request writes across Order, Payment, Inventory, Fulfillment, Tax, Promotion, Workflow, or Notification. @precondition @axis @security

  Documentation and acceptance:
    ☐ Define which beginner/business/developer documentation must exist before marking cancellation, return, and refund business-ready. @precondition @docs
    ☐ Document that temporary root docs are planning only; verified behavior must be promoted into module README/llm guidance and canonical documentation content after implementation. @precondition @docs
    ☐ Decide whether this detailed planning file should be force-added to source control despite root `/docs/` being ignored, or remain local planning evidence linked from tracked `docs/TODO`. @precondition @docs @governance
