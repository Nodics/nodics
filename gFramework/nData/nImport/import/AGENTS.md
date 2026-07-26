# import Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../../../AGENTS.md`.
- Follow global AI/development guidance: `../../../../gSetup/llm/README.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update `README.md`, permanent `docs/`, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

## Content-pack rules

- `nImport` is the only content-pack execution authority. System may expose
  secured control-plane routes and BackOffice clients may invoke them, but no
  client or experience module may create another importer.
- Treat a content pack as an immutable, versioned, checksummed release. Reject
  checksum changes without a version change and reject downgrades unless a
  later configuration layer explicitly permits them.
- Never give the local importer a source-controlled content-pack directory.
  Validate the release and copy it into server-owned staging because local
  import processing moves files.
- A published local content-pack repository must commit its directly importable
  data and manifest. Consumers must not build it, create client-owned staging,
  or submit arbitrary filesystem paths; only nImport creates temporary
  server-owned staging after validation.
- Do not resolve an import run or remove its staging while processed-file
  archival is still in flight. Success requires every processed file to reach
  its governed success location; archival failure must fail the run.
- Preserve the same `importRun` object across header finalization, finalized
  file processing, and model dispatch. Nested pipeline boundaries must not
  discard record counters, failures, tenant exclusions, or traceability.
- Configuration is disabled by default. Project and environment layers enable
  sources, permissions, cleanup, and update policy without changing framework
  source.
