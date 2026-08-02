# PayPal Provider Contract

`DefaultPaypalPaymentProviderAdapterService` must implement the Payment
provider operations `authorize`, `capture`, `void`, `refund`, and `reconcile`.
It returns normalized safe evidence only and must not expose raw PayPal order,
authorization, capture, refund, credential, or webhook payloads.
