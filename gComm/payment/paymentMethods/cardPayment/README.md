# cardPayment Module

`cardPayment` contributes the Card payment-method family. A payment method
defines how a customer wants to pay; the actual provider remains selectable
through Payment Core policy and provider adapters.

Card payment is gateway-backed by default. Customer modules can layer new card
rules, allowed provider types, fraud checks, authorization strategy, or Axis
presentation metadata without changing Payment Core.
