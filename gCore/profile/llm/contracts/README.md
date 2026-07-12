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
