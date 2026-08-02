# Stripe Provider

`stripeProvider` contributes a mocked Stripe-style adapter to the Payment
provider boundary. It models PaymentIntent-like authorization, later capture,
cancel/void, refund, and retrieval/reconciliation semantics without calling
Stripe.

Projects can replace `DefaultStripePaymentProviderAdapterService` with a real
connector while preserving Payment-owned transaction lifecycle and safe
evidence.
