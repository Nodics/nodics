# Promotion Foundation Contract

Promotion is the Commerce authority for promotion authoring metadata, coupon
metadata, evaluation-run evidence, and applied-discount evidence.

This contract is intentionally a foundation. It does not implement a complete
promotion rule engine yet. It creates the scalable model that a rule engine,
Workflow, external provider, or project-specific evaluator can consume later.

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

## Extension rules

- Add new condition/action types through layered configuration first.
- Add custom evaluation behavior through Promotion-owned services.
- Do not put executable JavaScript inside condition/action records.
- Do not calculate Promotion money with floating point.
- Do not move Promotion calculation into Pricing, Cart, Order, Tax, or Payment.
- Do not let public generated CRUD mutate applied-discount evidence.
- Keep applied evidence immutable once accepted by Cart/Order.

## Current limitations

- The first slice defines the model and validation contract.
- A full promotion evaluator, stacking arbitration engine, budget exhaustion,
  coupon redemption reservation, customer eligibility, and rollback workflow are
  future implementation slices.
- External promotion providers are not production-ready until adapter,
  credential, live-provider, failure, retry, reconciliation, and audit evidence
  are implemented.

## Verification

```bash
node gComm/promotion/test/promotionFoundationContract.test.js
```
