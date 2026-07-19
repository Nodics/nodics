# system

The system capability exposes Nodics operational APIs for configuration, files,
imports, exports, diagnostics, contracts, and tests. It is a control-plane
module: project modules may override its routers, controllers, facades, and
services through the normal later-loaded hierarchy.

## Control-plane route permissions

System APIs are backend control-plane routes. They may be called by an admin
application, CLI, AI tool, Postman, or support automation, but the security
contract is owned by route metadata.

Sensitive system routes must declare action-specific permissions:

- file read/download routes use `system.file.read` and
  `system.file.download`;
- import routes use `import.init.run`, `import.core.run`,
  `import.sample.run`, or `import.local.run`;
- log-level mutation uses `system.log.level.update`;
- schema index rebuild uses `system.schema.index.rebuild`;
- test execution uses `system.test.unit.run` or `system.test.nodics.run`;
- export uses `export.run`;
- OpenAPI and Swagger UI documentation use the `openApiContract` exposure category;
- runtime configuration routes use their `runtime.config.*` permissions.

Sensitive system routes also declare `apiExposure` categories so topology can
disable complete API families before permission checks or controller execution.
Current categories include `fileAccess`, `dataImport`, `dataExport`,
`logManagement`, `testExecution`, `schemaMaintenance`, `runtimeConfiguration`,
`operationalHealth`, and `openApiContract`. Project, environment, server, or
node configuration must explicitly enable categories that are not part of the
framework default runtime surface.

Do not expose system/control-plane behavior with only a broad group such as
`userGroup`. Add the permission to the catalog and a route contract test when a
new control-plane API is introduced.

## Health And Readiness

`GET /nodics/system/v0/health/live` is a low-disclosure liveness endpoint. It is
marked with `publicProbe: true` so infrastructure can confirm the process is
alive without enterprise or tenant headers. This is not the same as a normal
non-secured business route, which still resolves enterprise and tenant context.
Liveness must not return paths, provider endpoints, credentials, tenant data,
module lists, or diagnostic details.

`GET /nodics/system/v0/health/ready` is a secured readiness endpoint. It requires
`system.health.readiness.view` and `apiExposure.categories.operationalHealth`.
The default readiness service checks the runtime state, selected server, active
modules, and active tenants. Project modules may override
`DefaultHealthService` in a later layer to add database, cache, search,
messaging, storage, import/export, secret, or scheduled-job readiness checks
without exposing sensitive configuration.

## API Contract And Swagger UI

`nSystem` exposes the generated API documentation for the active runtime
boundary.

`GET /nodics/system/v0/contract/openapi` returns the machine-readable OpenAPI
contract generated under the active server or node `generated/openapi`
directory. It is a public documentation route only when the `openApiContract`
exposure category is enabled.

`GET /nodics/system/v0/contract/openapi/internal` returns that same authoritative
effective contract through the secured internal-service-token and
`serviceRegistry` exposure boundary. BackOffice capability discovery uses this
route so production discovery does not require public documentation exposure.
When a generated file is unavailable, the service builds the document from the
already-loaded effective router and schema registries through the existing
OpenAPI generator; it does not add another loader or persist a second contract.

`GET /nodics/system/v0/contract/swagger` returns interactive Swagger UI for that
same contract. It is browser-accessible for local/developer documentation when
`openApiContract` exposure is enabled. Swagger UI loads the local runtime
OpenAPI endpoint and serves approved UI assets through
`GET /nodics/system/v0/contract/swagger/asset/:assetName`.

Keep contract exposure disabled in shared, support, staging, and production-like
topologies unless the environment intentionally publishes API documentation.
Developer environments may expose it to trusted developers or AI tools. The
route still uses normal Nodics route exposure gates, request pipeline execution,
and response handlers; it does not create hidden Express middleware.

Projects may override `DefaultApiContractService` in a later active module to
brand the UI, filter operations, add environment labels, redact internal-only
contracts, or alter approved assets. Do not mount Swagger UI directly as hidden
Express middleware; doing so bypasses the route contract and makes the behavior
harder to override.

## Runtime property configuration

`POST /nodics/system/config` no longer mutates tenant properties directly. It
creates a `propertyConfiguration` activation request using the same governance
lifecycle as runtime schemas and routers:

1. preview the tenant-effective change;
2. persist a request bound to the exact property patch;
3. approve or reject with a different authenticated actor;
4. activate with an operator separated from requester and approver;
5. write correlated activation audit; and
6. rollback only the affected property paths.

The endpoint requires `runtime.config.request.create`. The request body accepts
`configuration` and `requestReason`; a legacy plain configuration object is
treated as the property patch but still enters the approval lifecycle.

The generic generated CRUD router for the `configuration` schema is disabled so
it cannot bypass this lifecycle; its generated service remains available for
internal framework use.

Sensitive property names such as passwords, tokens, API keys, private keys,
credentials, and secrets are rejected. They belong in layered external
configuration or an integrated secret manager. Prototype-mutating keys are also
rejected.

## Customization contract

Customer modules should override `DefaultConfigurationService` or the facade and
controller in a later module when adding policy. Overrides must preserve tenant
isolation, approval integrity, audit correlation, rollback, and route
permissions. Do not call `CONFIG.changeTenantProperties` from an externally
reachable path.

## Tests

System route and behavior contracts live under `test/`. Runtime governance
behavior is covered by nDynamo's `test:runtime-overrides` suite.

## Logging And Diagnostics

Logging is a platform capability with console, file, and provider-backed logger
configuration plus runtime log-level control. Logging and diagnostics guidance
belongs here only when it is system/control-plane behavior; provider-specific
logging adapters should remain behind their owning modules or project
overrides.

Diagnostics and logs must be sanitized. Never expose passwords, tokens, API
keys, cache keys, private keys, credentials, or secrets in logs, audit output,
or operational responses.
