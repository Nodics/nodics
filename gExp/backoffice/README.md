# backoffice

`backoffice` is the backend registry, discovery, catalogue, compatibility, and
bootstrap capability for the separate Nodics Axis administration application.

## Responsibilities

- Receive authenticated module self-registration and refresh requests.
- Maintain environment-bound observed deployment registrations.
- Discover and validate module identity, versions, capabilities, contracts, and
  sanitized health information.
- Expose a permission-filtered, client-safe registry to Nodics Axis.
- Select an optional CMS UI-composition provider without depending on CMS at
  package or startup level.
- Track BackOffice presentation enablement, compatibility, availability, and
  registry/discovery audit history.

## Explicit Exclusions

- No frontend source or executable UI delivery.
- No proxying of normal CRUD, job, workflow, CMS, or business operations.
- No replacement of target-module permissions, validation, tenant isolation,
  runtime activation, or business audit.
- No credentials, internal tokens, private keys, or unapproved internal
  endpoints in frontend registry responses.
- No parallel schema, router, topology, runtime-governance, or health authority.

## Runtime Interaction

The frontend authenticates with Profile, retrieves its authorized registry from
BackOffice, and then calls registered modules directly. Each target module
independently validates the Profile-issued human token and authorizes the
requested operation.

Module registration uses the separate Nodics service-to-service identity path.
Registration must be idempotent, environment-bound, auditable, retryable with
bounded backoff, and safe when BackOffice is unavailable.

The default implementation stores observed leases in process memory. This is
intentional: configuration and runtime activation remain authoritative in
Nodics, while modules reconcile automatically through periodic renewal after a
BackOffice restart. Multi-replica deployments may replace the same-name registry
service with a shared lease store without changing route or client contracts.

## Customization

Projects may override BackOffice configuration and contribute same-named
services, facades, controllers, routers, schemas, pipelines, interceptors, and
tests from later active modules. Override the smallest method or definition
required; do not copy the whole capability.

Control-plane registration routes require the governed internal-token
permission. Human discovery and diagnostics routes require distinct BackOffice
permissions and return only configured client-safe metadata.
