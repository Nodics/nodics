# Module Generation Guide

This guide tells AI tools and developers how to create project, environment,
server, and node modules without copying old framework templates or editing
out-of-the-box Nodics code.

Module generation is a contract-driven activity. The source of truth is the
module metadata, active-module hierarchy, layered configuration, source
definitions, tests, documentation, and generated artifacts produced from those
definitions.

## Non-Negotiable Rules

- Do not revive or copy `nCommon/templates`; the legacy template folder is
  intentionally retired.
- Do not create hidden scaffolding conventions that bypass Nodics metadata,
  loaders, configuration hierarchy, schema/router governance, or generated
  artifact lifecycle.
- Do not infer module kind from names, suffixes, folder depth, or examples such
  as `kickoff`. Runtime kind comes from `package.json.nodics.kind`.
- Do not edit released framework modules for customer behavior in
  application-developer mode. Put custom behavior in project-owned modules and
  layered overrides.
- Do not hand-maintain generated artifacts as source of truth. Change source
  definitions and regenerate derived files.

## Choose The Module Kind

Before creating files, classify the module by purpose:

| Kind | Purpose | Typical ownership |
| --- | --- | --- |
| `group` | Container that owns and orders child modules. | Framework capability group, project group, environment group. |
| `capability` | Reusable business or platform capability. | Framework module or project module. |
| `project` | Customer/application composition root when the project owns behavior. | Customer or application repository. |
| `environment` | Deployment-wide configuration for local, dev, QA, UAT, prod, or similar context. | Project environment layer. |
| `server` | One runnable process composition inside an environment. | Project runtime topology layer. |
| `node` | Instance-specific process override below a server. | Deployment/node layer. |

Use the kinds supported by current module metadata validation. If a new kind is
needed, update the metadata contract and tests first rather than inventing a
parallel naming rule.

## Required Files

Every generated module-shaped package must include the standard discoverable
surface:

```text
module/
  package.json
  nodics.js
  AGENTS.md
  README.md
  config/
    properties.js
    prescripts.js
    postscripts.js
  docs/
    README.md
  llm/
    README.md
    contracts/
      README.md
    examples/
      README.md
    generated/
```

Add `src/`, `data/`, and `test/` only when the module owns runtime behavior,
source definitions, import/export data, or tests. Empty extension files are
allowed only when they are intentional layered extension points and document why
they are empty.

## Metadata Contract

`package.json.name` is the runtime module identifier. It must be unique,
stable, and referenced by active-module configuration. The physical folder
should match `package.json.name` for new modules unless a documented
compatibility convention requires otherwise.

`package.json.nodics` must declare:

- `kind`: the module role such as `group`, `capability`, `project`,
  `environment`, `server`, or `node`.
- `runtime`: whether this package participates in runtime startup.
- `owns`: the schemas, routers, services, configuration, data, tests, topology,
  or generated artifacts owned by the module.
- parent or containment relationships required by the active module hierarchy.
- index/order values used by deterministic loading.

Metadata owns classification. Configuration owns activation and runtime values.
Source files own behavior. Documentation explains how to use and override the
module; it must not become an alternate source of truth.

## Active-Module Registration

Project modules become effective only through the active module hierarchy:

- group modules declare their contained modules through metadata and standard
  module discovery.
- environment modules define deployment-wide defaults and may activate groups
  or modules.
- server modules define the current process composition with
  `activeModules.groups` and `activeModules.modules`.
- node modules override only instance-specific behavior below a selected server.

Keep local activation separate from remote endpoint coordinates.
`activeModules` decides what runs in the current process. `server.<module>`
coordinates describe how to call local or remote module endpoints and must not
be treated as activation.

## Layered Override Boundary

When generating a custom module, decide whether it contributes a new capability
or overrides an existing one:

- Properties: add or override keys in `config/properties.js`.
- Schemas: contribute schema definitions with governed schema override metadata.
- Routers: contribute route definitions with governed router override metadata.
- Services: contribute the smallest necessary method override under
  `src/service/**`.
- Pipelines, interceptors, validators, controllers, facades, data, and tests:
  use the existing Nodics loaders and ownership conventions.

Do not copy a whole framework service, router, schema, or module just to change
one decision. Use the smallest later-layer contribution that preserves the
framework default and proves the customization path.

## Generated Artifacts

If the module changes schemas, routers, OpenAPI contracts, generated services,
facades, controllers, tests, or LLM context:

1. Change the source definition first.
2. Run the appropriate generation command.
3. Keep generated output in the module-owned generated location.
4. Validate that generated files contain standard headers and file-level
   documentation where required.
5. Never treat copied generated output as the editable source.

## Tests

Every generated module must include tests proportional to the behavior it owns:

- metadata validation for module kind, parent relationship, and index order.
- configuration-resolution tests for environment, server, and node layers.
- override/customization tests proving later modules can change behavior
  without editing framework code.
- generated CRUD, route, OpenAPI, import/export, cache, search, workflow,
  cron, event, tenant, and security tests when those capabilities are affected.
- topology tests for consolidated or modular runtime changes.

Use project-owned test modules and test tenants in application-developer mode.
Do not expand into framework-wide gates merely because the framework is present.

## Documentation And LLM Context

Each module must document:

- purpose and ownership.
- module kind and runtime role.
- dependencies and active-module registration path.
- configuration keys and override behavior.
- schemas, routes, services, data, tests, and generated artifacts it owns.
- tenant, security, audit, diagnostics, and rollback expectations.
- how a later project, environment, server, or node layer overrides it.

After implementation, regenerate module LLM context and validate it. Generated
context reports source-derived facts; it must not invent missing design intent.

## Completion Checklist

A generated custom module is complete only when:

- metadata classifies the module and its parent/ownership relationships.
- active-module registration is explicit and tested.
- configuration and override paths are documented.
- source definitions, generated artifacts, and runtime behavior are aligned.
- security, tenant, validation, audit, diagnostics, and rollback impacts are
  resolved or explicitly out of scope.
- focused tests pass for the module's owned behavior and customization path.
- README, AGENTS, docs, LLM contracts/examples, and generated LLM context are
  current.
