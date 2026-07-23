# profile

`profile` is the identity and tenancy system of record for a Nodics
application. In simple terms, it answers who a person or service is, which
enterprise and tenant they belong to, which groups and permissions they have,
and whether their credentials and sessions remain valid.

## Who Uses Profile

| Persona or caller | Typical workflow | Security boundary |
| --- | --- | --- |
| Customer | Register, sign in, maintain owned profile/contact/address data | Pre-authentication login followed by tenant-scoped bearer access and record ownership |
| Employee or administrator | Sign in and manage permitted enterprise data | Pre-authentication login followed by group and permission checks on every target route |
| Module or scheduled job | Obtain or use governed internal credentials | Secured service-token/API-key flow; never the human username/password route |
| Identity operator | Bootstrap, migrate, rotate, audit, or recover identity state | Explicit administrative permissions, versioned audit, redaction, and fail-closed recovery |
| BackOffice client | Discover allowed Profile operations and invoke Profile APIs | Profile stays authoritative; BackOffice receives no credential or authorization ownership |

**Maturity: Production-ready capability.** Production deployment still
requires governed bootstrap secrets, tenant-specific identity planning, and a
strict distributed authentication cache where multiple processes or nodes can
serve requests.

The profile capability owns tenant-scoped people, employees, customers,
service principals, credentials, user groups, addresses, contacts, enterprises,
tenants, and authentication state.

Profile schemas use explicit administrative access groups. Framework bootstrap
and authentication lookups receive a layered trusted service context; ordinary
authenticated users do not receive generated CRUD access to identity records.
Customer registration forces the configured customer group and removes caller-
supplied API keys, permissions, and privileged group assignments.

## Request And Authority Boundaries

```text
human credentials -> Profile login -> human access/refresh tokens
service identity   -> secured internal-token contract -> module/cron access
authenticated call -> target module route -> target permission and data policy
```

Profile validates identity and issues identity evidence. It does not authorize
every business operation centrally: each target module remains responsible for
its route permissions, schema access policy, tenant rules, and business data.
`nAuth`, `nToken`, `nCache`, and `nService` retain their framework security,
token, cache, and communication responsibilities.

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
Its provider roles and relative OpenAPI discovery coordinate allow BackOffice
to observe effective Profile operations without creating a second identity or
route contract.

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

## Deployment, Performance, And Operations

- Deploy Profile independently or in a consolidated runtime without changing
  its module contract. Other modules must tolerate temporary Profile
  unavailability through their owned startup and communication policy.
- Use a shared strict authentication cache for multi-process or multi-node
  deployments. A local cache is a development/reference choice, not a
  distributed session-invalidation solution.
- Keep password hashing, credential lookup, permission expansion, group
  traversal, and cache operations bounded. Test large group hierarchies and
  concurrent login/session invalidation against project service objectives.
- Rate-limit and monitor login, refresh, internal-token, migration, rotation,
  and administrative endpoints at the appropriate gateway and module layers.
- Observe authentication outcome/reason, tenant-safe principal identity,
  latency, lockout, token refresh/revocation, security-stamp propagation,
  migration, and bootstrap health. Never place passwords, API keys, raw tokens,
  or sensitive profile data in logs, metrics, traces, or generated context.
- Back up identity data and migration audits under project retention rules;
  rehearse restore, credential rotation, cache recovery, and rollback without
  restoring revoked plaintext credentials.

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

Initializer identity groups are deliberately discovered before employee
principals. This preserves fail-closed group and permission validation during a
clean database bootstrap: an employee cannot be persisted with a missing,
inactive, or unknown group merely because initialization is in progress.
Every permission seeded on a group must already exist in the effective
`identityGovernance.permissionCatalog`.

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

## Verification And Release Evidence

Run `npm run test:profile` for focused identity behavior. Changes must cover the
relevant positive, negative, boundary, contract, integration, and regression
cases, including wrong credentials, lockout, inactive identities, tenant
isolation, cross-tenant denial, group cycles, permission inheritance, session
invalidation, token refresh/logout, service-token permission, bootstrap,
migration, rotation, audit redaction, failure recovery, and distributed-cache
requirements. Run generated-context and release gates before changing maturity
or deploying security-sensitive changes.

## Continue

- Core capability family: [gCore](../README.md)
- Authentication framework: [nAuth](../../gFramework/nAuth/README.md)
- Token lifecycle: [nToken](../../gFramework/nToken/README.md)
- Cache and distributed state: [nCache](../../gFramework/nCache/README.md)
- Capability maturity: [Provider And Capability Maturity Matrix](../../gDocs/reference/provider-capability-maturity-matrix.md)
