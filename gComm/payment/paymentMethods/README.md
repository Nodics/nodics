# paymentMethods Module

`paymentMethods` groups payment method families. A method describes how a
customer intends to pay. A provider describes who or what executes the payment.

Included method boundaries:

- `cardPayment`
- `cashOnDeliveryPayment`
- `walletPayment`
- `bankTransferPayment`

These modules are first-class extension points even when the initial framework
implementation only contributes configuration and guidance.
