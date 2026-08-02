# payment Module

`payment` owns payment provider contracts and payment transaction evidence for
Commerce checkout. Cart and Order can reference payment groups and payment
evidence, but gateway decisions, authorization, capture, refund, void, and
provider lifecycle belong here.

This first foundation slice provides:

- `paymentProvider` for configured provider identities and supported operations;
- `paymentTransaction` for safe authorization/capture/refund/void evidence;
- `DefaultPaymentPolicyService` for exact-money validation and transaction
  draft creation;
- `DefaultPaymentCheckoutAuthorizationService` for checkout payment-group
  authorization orchestration;
- `DefaultPaymentRefundService` for idempotent refund transaction evidence;
- Payment-owned refund recovery through `retryRefund` and `reconcileRefund`;
- `DefaultPaymentProviderGatewayService` as a replaceable provider boundary.

The default provider boundary is intentionally non-gateway. It returns safe
simulated evidence for modes configured as in-framework/manual/deferred. Real
projects replace the provider service or provider registry in customer modules.
Do not add provider secrets to schemas or properties.

Checkout placement should call Payment through a Workflow action. Order remains
the placement authority, while Payment remains the payment authority.

## Checkout authorization

`DefaultPaymentCheckoutAuthorizationService` accepts produced order payment
groups from checkout placement. It builds one idempotent `paymentTransaction`
per payment group, delegates provider handling to
`DefaultPaymentProviderGatewayService`, and returns only safe evidence:
authorized transactions, deferred transactions, failures, and counts.

The default implementation supports distributed payment groups. For example,
one order can authorize a card payment group and defer a cash-on-delivery group
in the same checkout placement. Quantity-level relationships remain in
Order-owned `orderPaymentAllocation` records; Payment owns transaction
lifecycle evidence.

Customer modules customize payment by layering `payment.paymentPolicy` or
replacing Payment-owned services. They must not add card data, provider
credentials, raw gateway responses, or payment lifecycle logic to Cart or
Order.

## Refund transaction evidence

Refunds are Payment-owned transaction evidence. A return may be requested,
approved, picked up, and received by Fulfillment, but Payment owns the refund
operation against a payment provider or manual/deferred payment record.

`DefaultPaymentRefundService` builds one idempotent `paymentTransaction` with
operation `REFUND`, delegates safe provider handling to
`DefaultPaymentProviderGatewayService.refund`, and persists only safe evidence
such as transaction code, provider code, amount, currency, status, and provider
transaction reference. It rejects raw gateway payloads, card data, credentials,
and secrets.

Refund recovery also stays inside Payment. `retryRefund` reuses the same refund
idempotency key and transaction evidence. If the transaction is already
`REFUNDED`, it returns the existing safe evidence without calling the provider
again. If the transaction is still recoverable, such as `REQUESTED` or
`FAILED`, it retries through `DefaultPaymentProviderGatewayService.refund`,
updates Payment-owned recovery fields, and preserves the transaction identity.
`reconcileRefund` reads safe transaction evidence without calling the provider;
real PSP reconciliation can be layered by replacing Payment-owned services in a
customer module.

`DefaultPaymentRefundCalculationService` calculates the refundable amount before
provider refund execution. Order passes safe payment allocation evidence from
the reverse workflow, and Payment applies `payment.paymentPolicy.refundCalculation`
to decide the eligible amount, currency, allocation scope, and optional explicit
refund amount. This keeps split-payment and quantity-level refund rules in a
Payment-owned service instead of hiding them in Order or Axis.

Customer modules connect real PSP refund behavior by replacing the Payment
provider gateway, refund service, or refund calculation service. They should not
put refund logic in Order, Fulfillment, Cart, or frontend code. A full
return/refund business process should be coordinated through Workflow so
approvals, received goods, refund calculation, provider calls, notifications,
and compensation remain recoverable.
