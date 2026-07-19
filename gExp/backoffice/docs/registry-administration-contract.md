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
messages, or durable contract documents. Refresh is audited with module and
outcome only. Target APIs remain responsible for final business authorization.

## Validation

Changes require route-permission, filter, pagination, invalid-boundary,
sanitization, missing-module, refresh reuse, audit, OpenAPI, modular topology,
and regression tests.
