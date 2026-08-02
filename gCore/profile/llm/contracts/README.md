# profile AI Contracts

This folder contains module-specific AI/developer contracts for `gCore/profile`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Authentication route governance

- Internal authentication token retrieval must remain a permissioned service
  capability. The route should use `permissionConfig` to resolve
  `authSecurity.internalToken.routePermission`; cross-tenant access must
  additionally pass the configured internal-token cross-tenant policy, such as
  `auth.internal.token.read.anyTenant`.
- Do not weaken profile authentication routes by relying on broad `userGroup`
  access alone. Use layered identity-governance configuration when a project
  needs different permission names or service-principal policies.
- Employee and customer username/password login routes should be
  pre-authentication routes (`secured: false`) that still require enterprise
  context through the non-secured request pipeline before credential validation.
- Authentication, refresh, logout, authorization, and API-key changes must keep
  tenant isolation, reason/audit traceability, and credential-free logs.
- Keep module-to-module access separate: internal token retrieval, cron/job
  service calls, and cross-module API calls must continue to use secured API-key
  or internal-token flows.

## Enterprise management search

- `profile_searchenterprises` is the stable operation identity for the bounded
  `GET /enterprises/search` management intent.
- The route requires a human access token and `profile.enterprise.search`.
  Service tokens must fail even if a caller reaches the service directly.
- Accept only exact scalar `code`, `name`, and `active` filters and configured
  positive `page` and `limit` bounds. Reject unknown keys, object/operator
  filters, invalid booleans, unsafe codes, and out-of-bound pagination.
- Delegate persistence to `DefaultEnterpriseService` in the configured Profile
  enterprise tenant with `recursive: false`. Do not add an Assistant,
  BackOffice, Elasticsearch, or controller-owned search path.
- Project only the configured client-safe fields. Never expose contacts,
  addresses, credentials, secrets, API keys, or recursive tenant objects.
- Assistant policy may reference this operation by logical identity, but must
  rediscover its current method, path, and permission through BackOffice before
  every call and forward the employee bearer to Profile.

## Principal authorization scopes

- Profile owns the `principalScopeAssignment` schema and
  `DefaultPrincipalScopeGovernanceService`.
- Scope assignments model which principal or group can operate a tenant,
  enterprise, catalog, channel, store, region, business unit, or global scope.
- Do not put this relationship directly into tenant or enterprise schemas.
  Enterprise keeps its tenant reference, and Profile-owned scope assignments
  answer "who can operate what".
- Scope assignment can optionally narrow by `permissionCode` or
  `capabilityCode`; target modules still enforce their own route permission,
  schema policy, tenant rules, and business validation.
- `DENY` overrides matching `ALLOW`, inactive or expired assignments do not
  apply, and group assignments are resolved from the principal's known direct
  and expanded group codes.
- Project modules may add scope types, effects, statuses, and inheritance modes
  through layered `principalAuthorizationScopes` configuration or replace the
  service in a later module. Do not create an Axis-only or capability-local
  parallel registry.
- Validate changes with
  `node gCore/profile/test/principalAuthorizationScopeContract.test.js`.
