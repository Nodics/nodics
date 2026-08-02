# payment AI Contracts

Payment is the only Commerce capability that owns payment provider interaction
and payment transaction lifecycle.

- `paymentProvider` stores safe provider identity and capability metadata, not
  provider secrets.
- `paymentTransaction` stores exact, safe transaction evidence for
  authorization, capture, refund, void, deferred/manual payment, and failures.
- `DefaultPaymentRefundCalculationService` calculates eligible refund amounts
  from Order-provided payment allocation evidence before any provider refund is
  executed.
- `DefaultPaymentRefundService` creates idempotent `REFUND` transaction
  evidence from return or order-adjustment context.
- Payment refund recovery must remain Payment-owned. `retryRefund` may replay a
  recoverable `REQUESTED` or `FAILED` refund through the provider boundary using
  the same idempotency key, and must return an already `REFUNDED` transaction
  without calling the provider again. `reconcileRefund` may read safe Payment
  evidence but must not expose raw provider payloads.
- Cart and Order may pass payment group/allocation evidence into Payment, but
  they must not call gateways or mutate Payment transaction states directly.
- Checkout payment authorization must remain a Workflow action boundary.
- Return/refund orchestration must also remain Workflow-coordinated: Fulfillment
  owns return receipt evidence, Payment owns refund calculation and transaction
  evidence, and Order coordinates the business process.
- Provider selection, allowed operations, deferred/manual modes, and default
  provider mapping must be configuration-backed through `payment.paymentPolicy`.
- Provider BackOffice lifecycle execution must use the secured Payment-owned
  `POST /nodics/payment/v0/providers/lifecycle` route. Axis renders action
  metadata and posts a safe selected-record identity/model only; Payment maps
  action ids through an explicit service allow-list.
- Axis and Payment must treat `workbenchPresentation.forbiddenFields` as a
  redaction boundary. Forbidden provider fields are not displayed, not editable,
  and not echoed into lifecycle execution payloads.
- Customer modules customize by layering configuration or replacing Payment
  services. Do not fork Cart/Order payment group models to add gateway behavior.
