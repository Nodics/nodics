# BackOffice Administrative Security Contract

## Identity boundary

Human administrative operations use authenticated human access sessions and
action-specific permissions. Service identities remain restricted to module
registration and deregistration and are rejected from registry administration,
diagnostics, manual refresh, and contract decision operations even if a service
credential is accidentally granted an administrative permission.

The authenticated principal is required. When request and identity tenant are
both present they must match. Target modules retain final tenant and business
authorization for their own APIs.

## Permission matrix

| Operation | Permission |
| --- | --- |
| Client-safe module discovery | `backoffice.registry.view` |
| Client bootstrap | `backoffice.bootstrap.view` |
| Registry diagnostics | `backoffice.registry.diagnostics.view` |
| Administrative inventory/detail | `backoffice.registry.admin.view` |
| Manual availability/discovery refresh | `backoffice.registry.refresh` |
| Contract current/history/compare | `backoffice.contract.view` |
| Contract approval | `backoffice.contract.approve` |
| Contract rejection | `backoffice.contract.reject` |
| Contract rollback | `backoffice.contract.rollback` |

## Refresh abuse protection

Refresh is limited per tenant, principal, and module using layered
`backofficeRegistry.administration` policy. A bounded client-supplied
`Idempotency-Key` deduplicates in-flight work and briefly reuses completed
results. Counter and result maps are time-bounded and size-bounded. These rules
augment the existing Nodics route authorization and global HTTP hardening; they
do not create another authentication or permission authority.

## Audit disclosure

Administrative success and contract-decision audits may contain principal,
token type, tenant, trace, correlation, and request identifiers. Tokens,
authorization headers, endpoints, raw health content, and provider errors are
never retained.

## Required validation

Changes require human success, service-token rejection, missing-principal,
cross-tenant, permission-route, rate-boundary, independent-principal,
idempotency replay/in-flight, bounded-state, correlation-redaction, integration,
topology, and regression tests.
