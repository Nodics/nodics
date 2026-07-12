# system

The system capability exposes Nodics operational APIs for configuration, files,
imports, exports, diagnostics, contracts, and tests. It is a control-plane
module: project modules may override its routers, controllers, facades, and
services through the normal later-loaded hierarchy.

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
