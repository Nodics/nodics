# PayPal Provider

`paypalProvider` contributes a mocked PayPal-style adapter to the Payment
provider boundary. It models REST order authorization/capture/refund and
authorization void/reconciliation concepts without calling PayPal.

Projects can replace the adapter with a real connector while keeping Payment
as the authority for transaction lifecycle and safe evidence.
