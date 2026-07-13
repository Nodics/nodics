# nAuth Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../../gSetup/llm/README.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update `README.md`, permanent `docs/`, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

## Authentication And Authorization Rules

- Authentication, authorization, token, service-token, API-key, and security-stamp behavior is security-critical.
- Do not introduce local fallback for strict distributed auth state.
- Strict auth cache state must respect layered cache activation: global cache,
  the `profile.auth` channel, and the selected distributed engine must all be
  enabled before strict token/session state can start.
- Internal-token route permissions must be defined through
  `authSecurity.internalToken.routePermission` and resolved by router metadata,
  not hardcoded into profile routers.
- Preserve tenant isolation, replay protection, revocation, audit traceability, hashed secrets, scoped permissions, and distributed-cache correctness.
