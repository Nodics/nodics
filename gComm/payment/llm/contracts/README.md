# Payment Family Contracts

- `payment/paymentCore` owns payment lifecycle authority.
- `payment/paymentMethods` owns method-family boundaries.
- `payment/paymentProviders` owns provider adapter boundaries.

A payment method is not a provider. Card, cash on delivery, wallet, and bank
transfer are methods. Stripe, PayPal, CyberSource, and Visa are providers.
