# BackOffice Registry Administration Contract

## Boundary

Registry administration reads the same active lease store used by registration
and bootstrap. It does not maintain a second module inventory, topology source,
health authority, contract loader, or scheduler. Nodics runtime configuration,
target readiness, and target OpenAPI remain authoritative.

## Operations and permissions

- `GET /registry/admin/modules` requires `backoffice.registry.admin.view` and
  provides bounded filtering by module, capability, environment, server,
  availability, and compatibility.
- `GET /registry/admin/modules/:moduleName` requires
  `backoffice.registry.admin.view` and returns sanitized current leases and the
  normalized aggregate availability.
- `POST /registry/admin/modules/:moduleName/refresh` requires
  `backoffice.registry.refresh` and invokes the existing availability and
  discovery observers. It does not create another refresh queue or poller.

Search is capped at 100 results per request. Invalid pagination, state,
compatibility, and module coordinates fail closed. Refresh of an unknown or
non-client-callable module is rejected rather than reported as successful.

## Disclosure and audit

Responses use the configured client-safe lease projection. They never return
service tokens, credentials, raw readiness responses, stack traces, provider
messages, lease-expiry internals, or durable contract documents. The projection
includes environment, server, optional node, and `clientCallable` coordinates so
operators and clients can distinguish safe direct-call instances such as CMS
Staged and CMS Online. These observed coordinates never become configuration or
topology authority. Refresh is audited with module and outcome only. Target APIs
remain responsible for final business authorization.

When several active instances own the same module, consumers select using an
explicit governed coordinate such as environment and server. For example,
`cmsStagedServer` and `cmsOnlineServer` are both valid CMS registrations; the
client chooses authoring or delivery rather than accepting a registry-defined
default. Non-client-callable modules remain observable but never receive a
fabricated endpoint.

## Validation

Changes require route-permission, filter, pagination, invalid-boundary,
sanitization, missing-module, refresh reuse, audit, OpenAPI, modular topology,
and regression tests. Local modular acceptance also filters by declared
`schema` capability, rejects ambiguous CMS selection, and calls each selected
client endpoint directly.
