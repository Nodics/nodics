# cart Module

`cart` owns shopping-cart capability behavior in the commerce layer. It provides the module space for cart schemas, routes, controllers, facades, services, pipelines, interceptors, utilities, and tests.

Use this module for cart-specific behavior such as basket state, item operations, cart validation, and cart workflow integration. Order lifecycle behavior belongs in `gComm/order`.

Cart rules should be configurable and tenant-aware. Do not hardcode customer-specific pricing, promotion, or checkout assumptions into this module.
