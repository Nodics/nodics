# profile AI Contracts

This folder contains module-specific AI/developer contracts for `gCore/profile`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Authentication route governance

- Internal authentication token retrieval must remain a permissioned service
  capability. The route should require `auth.internal.token.read`; cross-tenant
  access must additionally pass the configured internal-token cross-tenant
  policy, such as `auth.internal.token.read.anyTenant`.
- Do not weaken profile authentication routes by relying on broad `userGroup`
  access alone. Use layered identity-governance configuration when a project
  needs different permission names or service-principal policies.
- Authentication, refresh, logout, authorization, and API-key changes must keep
  tenant isolation, reason/audit traceability, and credential-free logs.
