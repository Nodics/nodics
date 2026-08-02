# Card Payment Contracts

- Card methods require a provider adapter selected by Payment Core.
- Card modules never store PAN, CVV, gateway credentials, or raw PSP payloads.
- Customer modules may layer card-specific policies without changing Payment
  Core or provider modules.
