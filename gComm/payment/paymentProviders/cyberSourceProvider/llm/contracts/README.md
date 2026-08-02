# CyberSource Provider Contract

`DefaultCyberSourcePaymentProviderAdapterService` must implement the Payment
provider operations `authorize`, `capture`, `void`, `refund`, and `reconcile`.
It returns normalized safe evidence only and must not expose raw CyberSource
payment, key, merchant, card, credential, or webhook payloads.
