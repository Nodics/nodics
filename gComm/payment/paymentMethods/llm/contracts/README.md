# Payment Method Contracts

Every payment method must define:

- method identity;
- whether a provider is required;
- whether external gateway execution is expected;
- compatible provider types;
- safe customer/business-facing behavior.

Payment Core owns lifecycle evidence. Providers own adapter execution.
