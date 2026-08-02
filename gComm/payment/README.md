# payment Module

`payment` is the commerce payment family group. It organizes payment core
authority, payment method modules, and provider adapter modules under one clear
boundary.

```text
payment/
  paymentCore/
  paymentMethods/
    cardPayment/
    cashOnDeliveryPayment/
    walletPayment/
    bankTransferPayment/
  paymentProviders/
    stripeProvider/
    paypalProvider/
    cyberSourceProvider/
    visaProvider/
```

`paymentCore` owns payment schemas, secured operational routes, transaction
evidence, authorization, capture, void, refund, and reconciliation boundaries.
`paymentMethods` owns method families such as card, cash on delivery, wallet,
and bank transfer. `paymentProviders` owns provider adapters such as Stripe,
PayPal, CyberSource, and Visa.

Do not collapse method and provider into one concept. For example, Card is a
method; Stripe or CyberSource is a provider that may support the Card method.
