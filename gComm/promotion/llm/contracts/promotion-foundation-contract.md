# Promotion Foundation Contract

Promotion is the Commerce authority for promotion authoring metadata, coupon
metadata, evaluation-run evidence, and applied-discount evidence.

This contract is intentionally a foundation plus the first deterministic
evaluator and workflow lifecycle slices. It does not yet implement external
promotion providers or customer-specific rule engines. It does provide safe
declarative condition/action interpretation, stacking arbitration,
coupon/budget planning, rollback evidence, exact decimal-string
applied-discount totals, runtime persistence hooks, and Workflow-owned
approval/repair/reconciliation entry points.

## SAP Commerce / Hybris reference pattern

SAP Commerce separates promotion functionality into a Promotion Engine, Rule
Engine, Coupon module, and time/access promotion capabilities. The important
lesson for Nodics is not to copy SAP internals or Drools directly; the lesson is
that promotions require a separate authoring/evaluation/evidence boundary.

Nodics follows the same architectural shape in a Nodics-native way:

- Promotion owns campaign, rule, condition, action, coupon, evaluation, and
  applied-discount evidence.
- Pricing owns base price resolution.
- Tax owns tax calculation.
- Cart and Order own accepted commercial snapshots.
- Payment owns authorization/capture/refund money movement.

## Implemented schemas

### `promotionCampaign`

Groups business promotions such as seasonal sale, clearance, loyalty campaign,
or coupon campaign.

### `promotionRule`

Stores safe rule metadata:

- rule type: cart, entry, delivery, payment, order;
- priority;
- stacking group;
- exclusivity;
- whether a coupon is required;
- evaluation strategy.

The rule record does not contain executable code.

### `promotionCondition`

Stores bounded condition metadata. Examples:

- cart total is at least 100 USD;
- product belongs to category Shoes;
- customer is in Gold segment;
- channel is mobile;
- coupon exists.

### `promotionAction`

Stores bounded action metadata. Examples:

- fixed entry discount;
- percentage entry discount;
- fixed order discount;
- percentage order discount;
- free shipping;
- free gift.

### `couponCampaign` and `couponCode`

Represent coupon campaigns and coupon codes separately so the same campaign can
manage single-code, multi-code, or customer-assigned coupon behavior.

### `promotionEvaluationRun`

Records one evaluation result for a Cart, Order, Quote, or Preview. It includes
idempotency evidence and exact decimal-string totals.

### `appliedPromotion`

Records the actual applied discount evidence. This is the record Cart, Order,
Tax, Payment, Refund, reporting, and audit can trace.

## Beginner flow

1. A business user creates a campaign named "Summer Sale".
2. They add a rule: "Cart total must be at least 100 USD".
3. They add an action: "Apply 10% discount".
4. They optionally require coupon `SUMMER10`.
5. Checkout asks Promotion to evaluate the cart.
6. Promotion creates evaluation evidence and applied-discount evidence.
7. Cart accepts the result into `discountTotal`.
8. Order freezes the accepted result during checkout placement.
9. Tax and Payment use the accepted totals through their own authorities.

## Implemented evaluator behavior

`DefaultPromotionEvaluationService` evaluates Promotion-owned records against an
input snapshot supplied by Cart, Order, Quote, or Preview. Cart and Order should
call it through calculation-pipeline delegates instead of duplicating Promotion
logic. The runtime delegate operations are:

- `evaluateEntry` for cart-entry promotion evaluation;
- `evaluateCart` for aggregate cart promotion evaluation;
- `reconcileEntry` for order-entry promotion evidence reconciliation;
- `reconcileOrder` for aggregate order promotion evidence reconciliation.

The evaluator supports:

- active/effective-date filtering;
- `ALL` and `ANY` condition modes;
- safe operators such as equality, inclusion, existence, and exact decimal
  greater-than/less-than comparisons;
- fixed and percentage discounts with optional maximum discount caps;
- priority sorting;
- stackability groups;
- exclusive promotion behavior;
- coupon requirement checks;
- coupon hold/consume/release plans;
- promotion budget reserve/consume/release plans;
- rollback plans for checkout failure or workflow compensation.

The evaluator returns evidence and, when configured services are available,
persists `promotionEvaluationRun` and `appliedPromotion` records. It exposes
`consumeReservations` and `releaseReservations` so Checkout/Workflow can perform
irreversible coupon redemption, budget consumption, or rollback release in an
explicit business-process step. It still does not mutate cart totals, order
totals, tax totals, payment transactions, inventory, or fulfillment state.

## Workflow lifecycle behavior

Promotion lifecycle approval, rejection, repair, and reconciliation are
Workflow-owned processes. The default seed package defines:

- `promotionLifecycleManualFlow`;
- `promotionLifecycleAutomaticFlow`;
- manual review, manual completion, manual rejection, and automatic completion
  actions;
- channels that route approved, rejected, and automatic operations.

`DefaultPromotionLifecycleWorkflowService` adapts promotion campaign/rule
approval and evaluation repair requests into Workflow carriers. It enforces the
identity boundary:

- manual campaign/rule approval and rejection require human identity;
- automatic repair and reconciliation require service identity;
- service tokens cannot approve business records;
- human sessions cannot invoke privileged automatic repair directly.

Campaign and rule approvals update lifecycle status and audit fields such as
`approvedBy`, `approvedAt`, `workflowCarrierCode`, and `lastWorkflowDecision`.
`promotionEvaluationRun` and `appliedPromotion` remain immutable evidence.
Repair and retry must create governed workflow operations rather than modifying
old evaluation records.

## Extension rules

- Add new condition/action types through layered configuration first.
- Add custom evaluation behavior through Promotion-owned services.
- Do not put executable JavaScript inside condition/action records.
- Do not calculate Promotion money with floating point.
- Do not move Promotion calculation into Pricing, Cart, Order, Tax, or Payment.
- Do not let public generated CRUD mutate applied-discount evidence.
- Keep applied evidence immutable once accepted by Cart/Order.
- Keep long-running approval, retry, repair, and reconciliation in Workflow;
  use nPipeline only for atomic technical steps inside those processes.
- Keep human approval and service-token repair identities separate.

## Current limitations

- Runtime delegates, evidence persistence, coupon consume/release, budget
  consume/release, and workflow lifecycle entry points exist as service-level
  contracts. Public APIs, scheduler/event triggers, concrete repair executors,
  bounded retry state, and Axis operation buttons remain future slices.
- Customer eligibility, audience/segment providers, product/category hierarchy
  expansion, promotion provider adapters, and high-scale search/index
  optimization remain future slices.
- External promotion providers are not production-ready until adapter,
  credential, live-provider, failure, retry, reconciliation, and audit evidence
  are implemented.

## Verification

```bash
node gComm/promotion/test/promotionFoundationContract.test.js
node gComm/promotion/test/promotionEvaluationContract.test.js
node gComm/promotion/test/promotionRuntimePipelineDelegateContract.test.js
node gComm/promotion/test/promotionLifecycleWorkflowContract.test.js
```
