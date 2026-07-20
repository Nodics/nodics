# BackOffice Capability Discovery Contract

## Authority and ownership

Target modules remain authoritative for schemas, routers, permissions, generated
OpenAPI, jobs, workflows, import/export, and business behavior. A module declares
only BackOffice provider roles and safe relative discovery coordinates in
`config/properties.js#backofficeCapabilities.<moduleName>`. BackOffice must not add another schema or router
loader and must not allow administrators to edit discovered target-module
contracts.

The initial discovery source is the effective runtime OpenAPI artifact already
owned and exposed by System through its secured internal contract route at the
module-declared relative path. BackOffice
normalizes only operations whose `x-nodics.moduleName` matches the authenticated
registration. Generated OpenAPI remains the source contract; the normalized
snapshot is observed client metadata.

## Bounded asynchronous discovery

Registration and traffic readiness never wait for discovery. After an accepted
lease, `DefaultBackofficeDiscoveryService` schedules a deduplicated refresh using
the shared Nodics HTTP transport. The request uses the registered endpoint's
exact origin plus the declared relative path. Credentials, fragments, protocol-
relative paths, disallowed schemes, disallowed configured hosts, redirects,
oversized responses, excessive paths, and excessive operations are rejected.

Refresh cadence, timeout, size limits, operation limits, redirect behavior, and
optional host allowlists come from layered `backofficeRegistry.discovery`
configuration. Named-environment values belong under the existing `envs` module
hierarchy.

## Snapshots and change classification

Normalized snapshots contain only module name, contract type and version,
operation identifiers, paths, methods, schema names, operation names,
permissions, discovery time, and a deterministic SHA-256 hash. Raw untrusted
OpenAPI documents are not copied into the client catalogue.

Changes are classified as `INITIAL`, `UNCHANGED`, `NON_BREAKING`,
`POTENTIALLY_BREAKING`, or `BREAKING`. Removed operations and changed operation
paths or methods are breaking. Permission changes are potentially breaking.
Added operations are non-breaking. A breaking candidate never replaces the last
safe active snapshot. Every normalized observation is persisted through the
BackOffice-owned generated model services. The durable active-hash pointer is
the current-selection and replica-concurrency authority; the process snapshot
cache is rebuilt from it and registration reconciliation. Breaking candidates
require explicit revision-protected approval, and retained safe snapshots may
be selected through audited rollback as defined by the
[contract history lifecycle](contract-history-lifecycle.md).

## UI composition provider

A module may declare `UI_COMPOSITION_PROVIDER` plus non-executable default site,
catalogue, page, and fallback identifiers. BackOffice selects one authorized,
active, client-compatible provider using an optional layered preference and
returns it in bootstrap. It does not proxy CMS traffic or accept JavaScript,
renderer bundles, credentials, or arbitrary URLs. When no provider is safe,
bootstrap returns the static recovery-shell fallback.
