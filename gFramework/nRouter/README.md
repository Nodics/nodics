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

## Developer Guidance

Router guidance covers route registration, special routers, request objects,
response objects, and generated CRUD-style retrieve/save/update/remove
examples. Current router behavior must follow the security and
runtime-governance contracts in this module.

Routers should declare HTTP contract and access policy. Controllers map request
data into Nodics request context. Facades and services own behavior. Do not put
database operations or project-specific policy directly into router code.

## Extension Contract

Later modules may add, replace, disable, or govern routes through source
definitions, layered configuration, runtime governance, and tests. Any route
change must document permissions, tenant context, generated artifacts, OpenAPI
impact, and override behavior.
