# profile

The profile capability owns tenant-scoped people, employees, customers,
service principals, credentials, user groups, addresses, contacts, enterprises,
tenants, and authentication state.

Profile schemas use explicit administrative access groups. Framework bootstrap
and authentication lookups receive a layered trusted service context; ordinary
authenticated users do not receive generated CRUD access to identity records.
Customer registration forces the configured customer group and removes caller-
supplied API keys, permissions, and privileged group assignments.

Internal authentication token retrieval is a secured service capability. The
route permission is resolved from `authSecurity.internalToken.routePermission`,
which defaults to `auth.internal.token.read`. Cross-tenant retrieval also
requires the configured cross-tenant permission such as
`auth.internal.token.read.anyTenant`. Projects may change these permissions
through layered identity governance configuration, but must keep internal-token
access least-privilege and tenant-scoped.

Employee and customer username/password authentication routes are
pre-authentication routes. They are not protected by an existing bearer token or
API key, but they still require enterprise context so the non-secured request
pipeline can resolve the active tenant before credentials are validated.
Module-to-module communication remains a separate secured capability using API
keys and internal service tokens.

User-group save and update interceptors validate parent existence, active
parents, acyclic inheritance, and permission catalog membership. Principal
interceptors validate principal type, active group assignment, and service-only
API-key ownership against the fully merged persisted-plus-update state. Projects can extend these contracts through later module,
environment, server, node, tenant, and runtime layers.

## Governed identity migration

`DefaultIdentityGovernanceMigrationService` provides permissioned preview,
apply, and rollback operations. It records a tenant-scoped audit snapshot that
contains structural identity data only. Passwords and API-key values are never
written to the audit model. Apply is versioned and idempotent and reports which
service principals require credential rotation. Rotation is a separate
permissioned operation that accepts a client-generated replacement key, so the
caller retains the secret even if the response is interrupted. The key is
converted to a keyed digest before persistence and never returned by the API.
Legacy plaintext service keys are revoked during migration and are never
restored by rollback. Rollback touches
only the audited change set and deliberately keeps legacy human credentials
revoked.

## Ownership and session invalidation

Customer, address, and contact schemas opt into the framework record-ownership
policy. Customer requests are constrained to their own `ownerId`; trusted
administrative and service groups are explicit schema-level bypasses. Projects
may replace the policy or override its schema metadata in later hierarchy
layers.

Every principal carries an `authVersion`. Authentication registers it in the
auth cache, access and refresh tokens carry it, and user, password, or group
changes advance it. Production deployments must use a shared auth-cache engine
with local fallback disabled so invalidation propagates across modular servers
and nodes. Strict startup validation rejects an unsafe local-cache deployment.
Principal stamp targets are resolved from persisted records and registered only
after successful updates. Group updates traverse descendant groups so inherited
permission changes invalidate every affected session.

## Mandatory identity bootstrap

Profile contributes `DefaultMandatoryIdentityBootstrapService` through the
layered `mandatoryBootstrapServices` configuration. It runs after init data is
available and before internal service tokens are issued. The default
implementation creates only missing non-secret groups declared by the effective
identity-governance policy, never overwrites existing group customizations, and
records every creation in the identity migration audit model.

Projects can replace the service list, override the reconciler in a later module
layer, extend `identityGovernance.migration.groupTargets`, or disable automatic
group reconciliation. Missing service principals or credentials are not
silently recreated; those remain fail-closed governed recovery operations.

## Identity Capability Boundary

Profile guidance covers people, NAAM-style identity management,
authentication-facing data, authorization data, default auth token behavior,
and password management while preserving the split between `gCore/profile`
identity data and `gFramework/nAuth` security/token infrastructure.

Profile owns people, groups, credentials, tenants, enterprises, and persisted
identity state. `nAuth` owns framework security primitives, JWT/API-key
contracts, service tokens, cache requirements, and strict auth activation.
