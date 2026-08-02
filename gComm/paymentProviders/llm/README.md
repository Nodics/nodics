# Payment Providers LLM Guide

Payment provider modules are adapter modules. They translate between public PSP
concepts and Payment-owned normalized evidence.

Rules for AI tools:

- keep `gComm/payment` authoritative for transactions, methods, gateway
  execution, refund, void, reconciliation, and BackOffice metadata;
- put provider protocol behavior in child provider modules;
- never add dependencies to module `package.json` files;
- never store or log secrets, PAN, CVV, webhook secrets, or raw provider
  payloads;
- run `gComm/paymentProviders/test/paymentProviderAdapterConformanceContract.test.js`
  and Payment foundation tests after changing provider adapters.
