# Module Generation Guide

This guide tells AI tools and developers how to create new Nodics modules
without copying retired framework templates or editing out-of-the-box Nodics
code.

The standard folder/file structure for a generated capability module or pure
group module is defined in `standards/module-standard.md` under "Standard
Structure For Generated Modules And Group Modules". Project, environment,
server, and node module generation uses the same source-of-truth principles but
requires the boundary and topology rules defined in
`standards/nodics-structure-matrix.md`.

Module generation is a contract-driven activity. The source of truth is the
module metadata, active-module hierarchy, layered configuration, source
definitions, tests, documentation, and generated artifacts produced from those
definitions.

## Generation Commands

Use the contract-driven structure generator instead of retired template-copy
generation:

```text
npm run generate:app -- --name=<projectName> --path=<projectPath> --groupName=<companyGroup>
npm run generate:group -- --name=<groupName> --path=<groupPath>
npm run generate:module -- --name=<moduleName> --path=<modulePath>
npm run generate:env -- --name=<environmentName> --path=<environmentPath>
npm run generate:server -- --name=<serverName> --path=<serverPath>
npm run generate:node -- --name=<nodeName> --path=<nodePath>
npm run generate:provider -- --name=<providerName> --path=<providerPath>
```

These commands delegate to `structure:generate`, which creates metadata,
configuration, docs, LLM entries, source registries, service scaffolds, and
topology folders according to `standards/nodics-structure-matrix.md`. After
generation, run `npm run structure:audit -- --fail` before adding business
behavior.

For a full project topology, use the approval-first planner:

```text
npm run structure:plan -- --name=<projectName> --path=<projectPath> --groupName=<companyGroup> --modules=<moduleA,moduleB> --providers=<providerA> --envs=<local,dev> --servers=<apiServer> --nodes=<node0,node1>
```

The planner writes no files by default. Review the proposed project,
capability, provider, environment, server, node, index, path, and
`activeModules` placement first. After approval, re-run the same command with
`--apply`; the applied topology must pass `npm run structure:audit -- --fail`.

## Non-Negotiable Rules

- Do not revive or copy `nCommon/templates`; the retired template folder is
  intentionally retired.
- Do not create hidden scaffolding conventions that bypass Nodics metadata,
  loaders, configuration hierarchy, schema/router governance, or generated
  artifact lifecycle.
- Do not infer module kind from names, suffixes, folder depth, or sample
  project examples. Runtime kind comes from `package.json.nodics.kind`.
- Do not edit released framework modules for customer behavior in
  application-developer mode. Put custom behavior in project-owned modules and
  layered overrides.
- Do not hand-maintain generated artifacts as source of truth. Change source
  definitions and regenerate derived files.

## Choose The Module Kind

Before creating files, classify the module by purpose:

| Kind | Purpose | Typical ownership |
| --- | --- | --- |
| `group` | Container that owns and orders child modules. Concrete environments are also group modules because they contain server modules. | Framework capability group, project group, environment group. |
| `capability` | Reusable business or platform capability. | Framework module or project module. |
| `project` | Customer/application composition root when the project owns behavior. | Customer or application repository. |
| `server` | One runnable process composition inside an environment. | Project runtime topology layer. |
| `node` | Instance-specific process override below a server. | Deployment/node layer. |

Use the kinds supported by current module metadata validation. If a new kind is
needed, update the metadata contract and tests first rather than inventing a
parallel naming rule.

## Required Files

Every generated capability module or pure group module must include the
standard discoverable surface:

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

For capability modules, generate `src/` when the module owns source
definitions or implementation. Generate standard blank definition files such as
`src/event/listeners.js`, `src/pipelines/pipelines.js`,
`src/schemas/schemas.js`, `src/search/indexes.js`, and
`src/interceptors/interceptors.js` as `module.exports = {}` when the extension
point is intentionally present but no definitions exist yet.

For pure group modules, `src/` and `test/` are not mandatory unless the group
owns executable behavior, source definitions, or tests. Add `data/` only when
the module owns import/export or initializer data. Empty extension files are
allowed only when they are intentional layered extension points and document why
they are empty.

Concrete modules may own importable data using `data/init`, `data/core`, and
`data/sample`. `data/init` is startup/bootstrap data loaded only when
initialization is required, while `data/core` and `data/sample` are imported
intentionally through nData import APIs. Do not generate empty `data/`
directories for project roots or pure group modules.

## Custom Project Structure

Applications built on top of Nodics must use this project-level structure. A
project is also a module boundary, but it owns customer/application composition,
project modules, and deployment environments rather than a single reusable
framework capability.

```text
project/                        Project module boundary and ownership root.
  package.json                  Canonical project metadata, dependency metadata, runtime flags, ownership declaration, and `groupName` for grouping company projects.
  nodics.js                     Project lifecycle entrypoint used by Nodics startup and module loading.
  AGENTS.md                     AI/developer behavior contract for working inside this project.
  README.md                     Human-readable project guide covering purpose, owned modules, configuration, and extension paths.
  config/                       Layered project configuration and startup extension directory.
    properties.js               Standard owner for configurable values, policy defaults, tooling commands, discovery rules, and governance data.
    prescripts.js               Pre-startup extension declarations executed before the project's normal startup behavior.
    postscripts.js              Post-startup extension declarations executed after the project's normal startup behavior.
  docs/                         Permanent project documentation that is part of the application, not temporary project notes.
  llm/                          AI-facing guidance, contracts, examples, and generated context for this project.
    README.md                   Project-specific AI guidance entrypoint.
    contracts/                  Maintained AI/developer contracts that define project-specific rules.
    examples/                   Maintained examples showing correct customization and extension patterns.
    generated/                  Generated project context derived from source and regenerated by tooling.
  modules/                      Project-owned group modules or individual capability modules required by this project.
  envs/                         Environment modules such as local, dev, UAT, pre-prod, and prod.
```

When `package.json` belongs to a project, it must include a project grouping
property named `groupName`. `groupName` groups company projects and must not be
inferred from folder names.

Project module generation stops at `modules/` and `envs/` until the project
topology is agreed. Environment, server, and node structure must be discussed
and generated from topology-specific rules before writing those module files.
Project root tests should be limited to project composition contracts. Runtime
topology tests, server startup tests, node tests, and environment-owned init data
catalog tests belong under the environment, server, or node module that owns the
behavior or records.

## Blank Object File Template

Generated blank definition files must include the standard Nodics copyright
header and export an empty object:

```js
/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
module.exports = {

};
```

## Metadata Contract

`package.json.name` is the runtime module identifier. It must be unique,
stable, and referenced by active-module configuration. The physical folder
should match `package.json.name` for new modules unless a documented
compatibility convention requires otherwise.

`package.json.nodics` must declare:

- `kind`: the module role such as `group`, `capability`, `project`, `server`,
  or `node`. Concrete environment modules use `group` because they contain
  server modules.
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
- environment modules are `group` modules that define deployment-wide defaults
  and contain server modules.
- server modules define the current process composition with
  `activeModules.groups` and `activeModules.modules`.
- node modules override only instance-specific behavior below a selected server.

Keep local activation separate from remote endpoint coordinates.
`activeModules` decides what runs in the current process. `server.<module>`
coordinates describe how to call local or remote module endpoints and must not
be treated as activation.

## Hierarchy Proposal And Approval

Before generating or changing a customer project that contains multiple customer modules, environment group modules, server modules, or node modules, propose the loading hierarchy first and get explicit developer approval before writing module files.

The proposal must name:

- the project or customer module group that owns the composition.
- each capability module and why it is active.
- each environment group module and the deployment-wide overrides it owns.
- each server module and the process composition it runs.
- each node module and the instance-specific overrides it contributes.
- parent/child relationships, index/order values, and activation references.
- which behavior is local to the process and which behavior is reached through
  remote server coordinates.
- the tests that will prove hierarchy loading, override precedence, and
  consolidated or modular runtime behavior.

Do not generate module files first and ask the developer to infer the hierarchy
afterward. The hierarchy is part of the contract because it decides ownership,
configuration precedence, tenant/runtime behavior, generated artifacts, and the
verification boundary.

## Layered Override Boundary

When generating a custom module, decide whether it contributes a new capability
or overrides an existing one:

- Properties: add or override keys in `config/properties.js`.
- Schemas: contribute schema definitions with governed schema override metadata.
- Routers: contribute route definitions with governed router override metadata
  in `src/router/routers.js`; keep app-level router configuration in
  `src/router/appConfig.js`.
- Services: contribute the smallest necessary method override under
  `src/service/**/*Service.js`; when a module has `src/service/`, generate
  `src/service/defaultSampleService.js` with `init` and `postInit` so the service
  extension shape is explicit even before concrete behavior is added.
- Controllers: contribute controller methods under
  `src/controller/**/*Controller.js`.
- Facades: contribute facade methods under `src/facade/**/*Facade.js`.
- Pipeline definitions: contribute definitions in
  `src/pipelines/pipelines.js`.
- Interceptors, validators, data, and tests: use the existing Nodics loaders and
  ownership conventions.
- Utilities: generate `src/utils/utils.js`, `src/utils/enums.js`, and
  `src/utils/statusDefinitions.js` so helpers, enum contracts, and status/error
  definitions have explicit ownership from the first commit.

Do not copy a whole framework service, router, schema, or module just to change
one decision. Use the smallest later-layer contribution that preserves the
framework default and proves the customization path.

Runtime services, controllers, facades, and pipeline-support modules must export
mergeable object members using `module.exports = { methodName: function (...) {}
}`. Do not create behavior in a custom folder or standalone export when the
intent is a Nodics runtime override; that file will be outside the loader radar
and customer projects will not be able to override it cleanly.

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
- any multi-module project hierarchy was proposed and approved before files
  were generated or changed.
- active-module registration is explicit and tested.
- configuration and override paths are documented.
- source definitions, generated artifacts, and runtime behavior are aligned.
- security, tenant, validation, audit, diagnostics, and rollback impacts are
  resolved or explicitly out of scope.
- focused tests pass for the module's owned behavior and customization path.
- README, AGENTS, docs, LLM contracts/examples, and generated LLM context are
  current.
