# nConfig Agent Contract

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
- Resolve runtime hierarchy from `package.json.nodics.kind`, parent relationships, configured active modules, required modules, runtime flags, and module index order. Never infer behavior from names ending in `Env`, `Server`, `Node`, or from a project prefix.
- Treat environment/server/node configuration as selected-runtime layers: environment group, environment/server-root, server, then optional node.
- Update `README.md`, permanent `docs/`, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.
