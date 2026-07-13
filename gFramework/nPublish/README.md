# nPublish

`nPublish` provides framework publishing support for runtime/module activation patterns. It is the place for generic publish-time contracts, schemas, routes, and pipeline hooks that support publishable module variants.

Use this module for publish capability behavior that is not specific to one provider or domain. Variant modules such as `vDatabase` or `vMongodb` should contain variant wiring, not duplicated publish infrastructure.

Publishing behavior must remain source-of-truth driven, auditable, rollback-aware, and safe for layered overrides across environment, server, node, tenant, and customer layers.
