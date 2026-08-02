# Visa Provider Contract

`DefaultVisaPaymentProviderAdapterService` must implement the Payment provider
operations `authorize`, `capture`, `void`, `refund`, and `reconcile` only as a
product-specific adapter contract. It must not pretend that Visa is always a
generic merchant PSP, and it must not expose raw Visa product payloads,
credentials, PAN, or CVV.
