# order Module

`order` owns order capability behavior in the commerce layer. It provides the module space for order data, schemas, routes, services, pipelines, interceptors, utilities, and tests.

Use this module for order-specific lifecycle behavior after cart conversion, including order creation, validation, state handling, and integration events. Cart behavior remains in `gComm/cart`.

Order extensions must preserve auditability, tenant context, access control, rollback safety, and generated artifacts from source definitions.
