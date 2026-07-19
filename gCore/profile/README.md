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

Profile owns its optional BackOffice catalogue declaration in `package.json`.
The declaration identifies the identity capability, navigation hint, contract
version, and discovery permission; it does not transfer authentication or
authorization authority to BackOffice.

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
Existing plaintext service keys are revoked during migration and are never
restored by rollback. Rollback touches
only the audited change set and deliberately keeps existing human credentials
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

Mandatory active `admin` and `apiAdmin` initializer records require validated
bootstrap identity configuration. The `bootstrapIdentity` property must declare
its source and provide separate admin password, service password, and service
API-key values. Production-like deployments should supply those values through
governed project/environment/server/node configuration, external properties, or
a secret manager. Local sample credentials are accepted only when the active
environment explicitly enables the local bootstrap compatibility flag.

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

## NAAM-Style Identity Model

NAAMS means Nodics authentication and authorization management.
In the current framework, this capability is split cleanly:

- `profile` owns persisted identity data and tenant/business identity models.
- `nAuth` owns framework authentication primitives, token behavior, API-key
  contracts, service-token handling, and auth cache requirements.

Profile-owned identity data includes:

- enterprise and tenant records;
- users, customers, employees, and service principals;
- addresses and contacts;
- user groups and inherited permissions;
- passwords and credential state;
- API-key ownership metadata;
- identity migration and bootstrap audit data.

Do not add authentication token infrastructure to profile when it belongs to
`nAuth`, and do not add persisted identity business data to `nAuth` when it
belongs to profile.

## Authentication And Password Management

Human username/password login is pre-authentication behavior. It still needs
enterprise and tenant context before credentials can be validated, but it does
not require an existing bearer token.

Module-to-module and service-account access are separate secured capabilities.
They must use API keys, internal service tokens, route permissions, tenant
scoping, auth-version invalidation, and strict cache requirements.

Password and credential changes must:

- validate the principal and tenant;
- update auth-version or equivalent invalidation state;
- invalidate affected sessions;
- avoid exposing secrets in logs, responses, generated context, or audit
  snapshots;
- preserve rollback rules defined by identity governance.

## Group And Permission Governance

Groups are not just labels. They carry access contracts.

When adding or changing groups, document:

- parent group relationship;
- inherited permissions;
- active/inactive behavior;
- tenant/customer scope;
- generated API access;
- bootstrap or migration behavior;
- tests for parent validation, cycle prevention, and permission catalog
  membership.

Customer registration must not allow callers to assign privileged groups,
permissions, API keys, or service-only state. Those changes require governed
administrative or service flows.
