# Promotion

`promotion` is the Nodics Commerce capability for promotion campaigns, promotion
rules, rule conditions, rule actions, coupon campaigns, coupon codes,
promotion-evaluation evidence, and applied-discount evidence.

Promotion does not own base prices, tax calculation, cart lifecycle, order
lifecycle, payment capture, inventory, fulfillment, or customer identity. Those
capabilities stay in their own modules. Promotion produces or records discount
evidence that Cart and Order may accept as frozen commercial snapshot values.

## Beginner explanation

A promotion is a business offer, such as:

- "10% off if the cart total is at least 100 USD";
- "Use coupon `SUMMER10` to get 10 USD off";
- "Buy this product and get free shipping";
- "Give a free gift when the customer buys a bundle".

In a scalable commerce platform, we should not store only one field named
`discountTotal` and call it done. Business users need to know:

1. which campaign the discount came from;
2. which rule was evaluated;
3. which conditions matched;
4. which action created the discount;
5. whether a coupon was used;
6. which cart/order/entry/delivery/payment target received the discount;
7. how the discount interacts with tax, payment, refund, and order history.

That is why Nodics separates authoring records from applied evidence.

## Implemented foundation

- `promotionCampaign` groups business promotions.
- `promotionRule` stores safe rule metadata such as rule type, priority,
  exclusivity, coupon requirement, condition mode, and evaluation strategy.
- `promotionCondition` stores bounded condition metadata. It is not executable
  code.
- `promotionAction` stores bounded action metadata such as fixed discount,
  percentage discount, free shipping, or free gift.
- `couponCampaign` groups coupon behavior and redemption limits.
- `couponCode` stores safe coupon-code lifecycle and redemption counters.
- `promotionEvaluationRun` records one evaluation request/result for Cart,
  Order, Quote, or Preview.
- `appliedPromotion` records the actual applied discount evidence that Cart,
  Order, Tax, Payment, Refund, and reporting can trace.
- `DefaultPromotionEvaluationService` provides the first deterministic
  evaluator slice for declarative conditions, configured actions,
  priority/stacking/exclusive arbitration, coupon hold/consume/release planning,
  budget reservation/exhaustion planning, rollback evidence, and exact
  decimal-string discount totals.
- `DefaultPromotionLifecycleWorkflowService` adapts approval, rejection,
  repair, and reconciliation requests to Workflow-owned carriers so long-running
  business processes do not become hidden synchronous service logic.

All records are enterprise-scoped, generated-service backed, and not exposed
through public generated CRUD routes by default.

## Example: cart coupon discount

A business creates a campaign:

```json
{
  "campaignCode": "summer-sale",
  "name": "Summer Sale",
  "campaignType": "MERCHANDISING",
  "status": "ACTIVE"
}
```

Then it creates a rule:

```json
{
  "ruleCode": "summer-cart-10",
  "campaignCode": "summer-sale",
  "name": "10 percent off cart",
  "ruleType": "CART",
  "couponRequired": true,
  "conditionMode": "ALL",
  "priority": 50,
  "status": "ACTIVE"
}
```

Then it creates a condition:

```json
{
  "conditionCode": "summer-cart-total",
  "ruleCode": "summer-cart-10",
  "conditionType": "CART_TOTAL",
  "operator": "GREATER_THAN_OR_EQUALS",
  "value": {
    "currencyCode": "USD",
    "amount": "100.00"
  }
}
```

Then it creates an action:

```json
{
  "actionCode": "summer-cart-10-action",
  "ruleCode": "summer-cart-10",
  "actionType": "ORDER_PERCENTAGE_DISCOUNT",
  "targetType": "CART",
  "currencyCode": "USD",
  "discountRate": "10.00",
  "maxDiscountAmount": "25.00"
}
```

When Cart asks Promotion to evaluate `cart-100`, Promotion can create:

```json
{
  "evaluationCode": "cart-100-promo-eval",
  "sourceType": "CART",
  "sourceCode": "cart-100",
  "subtotalAmount": "120.00",
  "discountTotal": "12.00",
  "currencyCode": "USD",
  "appliedRuleCodes": ["summer-cart-10"],
  "status": "EVALUATED"
}
```

And line-level applied evidence:

```json
{
  "appliedPromotionCode": "cart-100-line-1-summer-cart-10",
  "evaluationCode": "cart-100-promo-eval",
  "ruleCode": "summer-cart-10",
  "couponCode": "SUMMER10",
  "sourceType": "CART",
  "sourceCode": "cart-100",
  "targetType": "ENTRY",
  "targetCode": "line-1",
  "actionType": "ORDER_PERCENTAGE_DISCOUNT",
  "discountAmount": "12.00",
  "currencyCode": "USD",
  "taxTreatment": "BEFORE_TAX",
  "status": "APPLIED"
}
```

Cart can then copy the accepted total into `cartEntry.discountTotal`. Order can
later freeze the same commercial evidence during checkout placement.

## Runtime evaluator slice

`DefaultPromotionEvaluationService.evaluate` accepts an already-authorized
evaluation context and the Promotion-owned records to consider. It stays
deterministic and does not query Cart or Order directly. Cart and Order use
runtime delegate operations instead:

- `evaluateEntry` evaluates a cart-entry snapshot.
- `evaluateCart` evaluates an aggregate cart snapshot.
- `reconcileEntry` reconciles promotion evidence for an order entry.
- `reconcileOrder` reconciles promotion evidence for an aggregate order.

1. Cart, Order, Quote, or Preview provide the source snapshot and idempotency
   key.
2. Promotion evaluates safe metadata, calculates exact decimal-string discount
   evidence, and returns an evaluation run plus applied promotion records.
3. Promotion persists `promotionEvaluationRun` and `appliedPromotion` evidence
   when generated schema services are available and
   `promotion.runtime.persistEvaluationEvidence` is enabled.
4. Checkout or Workflow calls Promotion-owned `consumeReservations` after order
   placement, or `releaseReservations` during checkout rollback.

This keeps promotion evaluation deterministic and testable while giving
Checkout/Workflow owned, explicit hooks for irreversible redemption, rollback,
approval, repair, and retry behavior.

## Workflow lifecycle

Promotion lifecycle changes are business processes, not direct table edits.
Nodics seeds two Workflow heads:

- `promotionLifecycleManualFlow` for campaign/rule approval or rejection by a
  human employee;
- `promotionLifecycleAutomaticFlow` for service-token-only evaluation repair or
  reconciliation requests.

Manual workflow actions must run with a human identity. A service token cannot
approve or reject a campaign or rule. Automatic repair/reconciliation actions
must run with a service identity. A human session cannot invoke automatic repair
as a hidden privileged operation.

When a campaign or rule is approved, Promotion updates the lifecycle status and
stores audit evidence such as `approvedBy`, `approvedAt`,
`workflowCarrierCode`, and `lastWorkflowDecision`. Evaluation and applied
discount evidence remain immutable; repair and retry create governed workflow
requests instead of rewriting old evidence.

## Repair, retry, and reconciliation

Promotion evaluation evidence is immutable. If an evaluation fails, is rejected,
or needs reconciliation, Promotion does not edit the old
`promotionEvaluationRun`. It creates a `promotionRepairRun` record that explains
what operation was requested, which evaluation was targeted, how many retry
attempts were used, and whether a new evaluation run was created.

For a beginner, think of it like this:

1. Cart asks Promotion to evaluate discounts.
2. Promotion writes an evaluation receipt.
3. If that receipt failed for a repairable reason, Workflow can ask Promotion to
   repair it.
4. Promotion creates a repair-run receipt.
5. If enough safe source snapshot data exists, Promotion evaluates again and
   links the new evaluation receipt from the repair run.

Internal repair, retry, and reconcile routes are service-token-only operations.
They are not employee CRUD screens and they are not public customer APIs. Human
employees may review approval workflows, but automatic repair/reconciliation
must run as a governed service identity so the audit trail clearly separates
business decisions from operational recovery.

Customer modules can customize repair behavior by layering:

- repairable failure-code policy;
- maximum retry counts;
- source-snapshot reconstruction;
- repair workflow heads/actions/channels;
- reconciliation scheduling and event triggers.

They must not mutate historical `promotionEvaluationRun` or
`appliedPromotion` records. If the commercial answer changes, write new evidence
and link it from the repair run.

Customer modules can replace workflow heads, actions, channels, and repair
services through layered modules. They must preserve:

- Workflow ownership of long-running approval/repair processes;
- Promotion ownership of campaign/rule/evaluation evidence;
- human-only manual decisions;
- service-token-only automatic repair;
- immutable `promotionEvaluationRun` and `appliedPromotion` evidence.

## Tax and payment relationship

Promotion records discount evidence. Tax decides whether tax is calculated
before or after the discount according to jurisdiction and pricing context.
Payment authorizes or captures the final amount accepted by Checkout/Order.

For example, if the promotion is `BEFORE_TAX`, Tax may reduce the taxable base.
If it is `AFTER_TAX`, Tax may calculate first and then the discount is applied
to the gross amount. Promotion stores the `taxTreatment` decision as evidence,
but Tax remains authoritative for tax calculation.

## Customization

Customer modules can add:

- new campaign types;
- new condition types;
- new action types;
- project-specific evaluation strategies;
- stricter coupon redemption policies;
- a custom promotion evaluator service;
- integration with an external promotion engine.
- alternative runtime persistence, coupon, or budget repository services.

The smallest supported override is to layer `promotion.rule` configuration in a
customer module:

```js
module.exports = {
  promotion: {
    rule: {
      conditionTypes: [
        "ITEM",
        "CATEGORY",
        "CART_TOTAL",
        "CUSTOMER_GROUP",
        "CHANNEL",
        "COUPON",
        "LOYALTY_TIER",
      ],
      actionTypes: [
        "ENTRY_FIXED_DISCOUNT",
        "ENTRY_PERCENTAGE_DISCOUNT",
        "ORDER_FIXED_DISCOUNT",
        "ORDER_PERCENTAGE_DISCOUNT",
        "FREE_SHIPPING",
        "FREE_GIFT",
        "LOYALTY_POINTS",
      ],
    },
  },
};
```

Do not fork Cart, Order, Pricing, or Tax to add a promotion rule. Add or replace
Promotion-owned policy/evaluation services and keep the applied result as
Promotion-owned evidence.

For deeper behavior, replace or layer
`DefaultPromotionEvaluationService` in a customer module. Preserve these
contracts:

- exact decimal-string arithmetic;
- no executable rule payloads;
- coupon hold/consume/release evidence;
- budget reserve/consume/release evidence;
- immutable applied-discount evidence once Cart or Order accepts it;
- no hidden Cart, Order, Tax, Payment, Inventory, or Fulfillment mutations from
  the evaluator.

## Verification

```bash
node gComm/promotion/test/promotionFoundationContract.test.js
node gComm/promotion/test/promotionEvaluationContract.test.js
node gComm/promotion/test/promotionRuntimePipelineDelegateContract.test.js
node gComm/promotion/test/promotionLifecycleWorkflowContract.test.js
node gComm/test/commerceOperationsBackofficeNavigationContract.test.js
```
