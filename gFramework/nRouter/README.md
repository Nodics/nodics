# nRouter

`nRouter` owns request routing, secured request pipelines, route action
authorization, OpenAPI generation, and route metadata governance.

Routes may define literal `permission` or `permissions` values for fixed
platform actions. When a permission is expected to vary by project,
environment, server, node, tenant, or runtime governance, prefer
`permissionConfig` with a layered configuration path such as
`authSecurity.internalToken.routePermission`. The secured request pipeline
resolves that value from effective configuration before checking the
authenticated principal's permissions.
