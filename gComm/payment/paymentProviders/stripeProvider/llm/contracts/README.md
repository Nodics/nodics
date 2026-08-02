# Stripe Provider Contract

`DefaultStripePaymentProviderAdapterService` must implement the Payment
provider operations `authorize`, `capture`, `void`, `refund`, and `reconcile`.
It returns normalized safe evidence only and must not expose raw Stripe
PaymentIntent, Refund, customer, card, credential, or webhook payloads.
