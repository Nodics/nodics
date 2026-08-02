# Payment Family Examples

## Add a new payment provider

Add a provider module under `payment/paymentProviders/<providerName>Provider`.
Register adapter defaults through layered configuration. Do not add provider
secrets to framework properties.

## Add a new payment method

Add a method module under `payment/paymentMethods/<methodName>Payment`.
Method modules describe method policy; provider execution remains in provider
modules and payment lifecycle remains in `paymentCore`.
