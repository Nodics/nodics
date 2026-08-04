# profile Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../../gSetup/llm/ai-enablement-index.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/contracts`, `llm/examples`, generated context, and tests whenever behavior or extension contracts change.
- Use `llm/contracts` for exact module-local AI/developer rules, `llm/examples` for approved patterns, and `llm/generated` for source-derived facts. Do not add a module-local llm README file; this `AGENTS.md` is the AI navigation and behavior entrypoint for the module.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
- Extend reusable Profile access/ownership defaults through layered
  `schemaPolicies.profile`; do not copy full schemas or add local access-policy
  factory functions.
- Internal authentication token routes are service capabilities, not generic
  user routes. Preserve explicit route permissions and tenant/cross-tenant
  governance when changing profile authentication routers or controllers.
- Employee and customer username/password authentication routes are
  pre-authentication routes: they must resolve enterprise/tenant context before
  credential validation without requiring an existing bearer token or API key.
  Do not weaken module-to-module internal token routes when changing them.
- Browser session restoration is Profile-owned. Keep refresh credentials in a
  scoped HttpOnly cookie, return access tokens only to client memory, require
  exact credentialed-CORS origins plus double-submit CSRF for restore/logout,
  rotate refresh state on every restore, and clear/revoke it on logout. Never
  introduce browser storage, a BackOffice-owned token authority, wildcard
  credentialed CORS, or non-Secure cookies outside loopback local development.
- Enterprise management APIs must remain Profile-owned, human-access-token
  protected, action-permissioned, bounded, and explicitly projected. Reuse the
  generated enterprise service; do not expose generic schema CRUD to an AI
  tool, add a parallel search/index path, or return recursive identity data.
