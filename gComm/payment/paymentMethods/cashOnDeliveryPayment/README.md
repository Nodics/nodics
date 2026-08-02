# cashOnDeliveryPayment Module

`cashOnDeliveryPayment` contributes deferred Cash on Delivery method behavior.
It lets checkout plan payment without immediate gateway authorization while
still creating Payment-owned transaction evidence.

Projects can customize COD eligibility, enterprise/country limits, advance
amount rules for overbooking, or reconciliation behavior through layered
Payment policy and services.
