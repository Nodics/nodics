# Nodics Structure Matrix

This matrix defines the standard ownership boundaries for Nodics projects,
group modules, capability modules, environments, servers, and nodes. Use it
when generating new structure, reviewing copied structure, or deciding where a
new file, configuration value, data record, test, or override belongs.

The matrix is intentionally metadata-first. Folder names help humans, but
runtime meaning comes from `package.json`, `package.json.nodics`, active-module
configuration, and the selected environment/server/node hierarchy.

## Boundary Matrix

| Boundary | Metadata kind | Primary purpose | Owns | Must not own |
| --- | --- | --- | --- | --- |
| Project root | `project` | Customer/application composition root. Groups company projects, project modules, and deployment environments. | Project metadata, project-level defaults, project-owned documentation, project module catalog, environment catalog. | Framework behavior changes, server/node runtime generated artifacts, bootstrap/sample data that belongs to a concrete environment/server/module. |
| Project module group | `group` | Container that groups related project-owned modules. | Child module ordering, shared project-module documentation, optional shared configuration when the group is active. | Concrete business behavior unless the group intentionally has source and tests. |
| Framework group module | `group` | Container that groups related framework capability/provider modules. | Child capability/provider ordering, shared framework defaults, group-level docs and LLM guidance. | Customer-specific behavior or project hardcoding. |
| Capability module | `capability` or existing module-specific kind | Reusable framework or project capability. | Source definitions, services, controllers, facades, routers, schemas, search indexes, interceptors, pipelines, utilities, module data, tests, docs, generated context. | Cross-project topology decisions, unrelated provider choices, hidden behavior outside loader-visible folders. |
| Environment module | `group` | Deployment environment boundary such as local, dev, UAT, pre-prod, or prod. Environments are group modules because they contain server modules. | Environment-wide configuration defaults, environment-owned data, environment documentation, server module catalog. | Per-process runtime composition that belongs to a server, instance-specific overrides that belong to a node. |
| Server module | `server` | Runnable process composition inside an environment. | Process-level active module selection, server port/runtime configuration, server-owned generated reports/artifacts, server-owned tests, server-specific data. | Deployment-wide defaults that belong to the environment, instance-specific node overrides, reusable framework behavior. |
| Node module | `node` | Instance-specific override below a selected server. | Node id, node-local configuration, node-owned runtime overrides, node-specific tests and diagnostics. | Server-wide process composition, environment-wide data, reusable capability implementation. |

## Ordering And Classification Rules

- `package.json.name` is the canonical runtime module identifier.
- `package.json.nodics.kind` classifies the boundary. Do not infer kind from
  `n` prefixes, folder depth, names like `Env`, `Server`, or `Node`, or sample
  project naming.
- `package.json.nodics.runtime` and active-module configuration decide whether
  a package participates in runtime startup.
- Explicit metadata and selected topology decide parent/child relationships.
- Environment modules are `group` modules; server and node modules are concrete
  runtime topology modules.
- Local activation and remote coordinates are different contracts:
  `activeModules` loads behavior into the current process, while `servers.*`
  coordinates describe how to call local or remote endpoints.

## Metadata Matrix

`package.json` is the source of truth for a boundary identity. It must classify
what the boundary is, what it owns, and whether Nodics loaders may consider it
at runtime. It must not carry activation lists, server endpoint maps, secrets,
or environment-specific values; those belong in layered `config/properties.js`.

Every generated boundary must define `name`, `index`, `main`, `version`,
`description`, `dependencies`, and `nodics`. The standard `main` value is
`nodics.js`. `name` is the runtime module id, `index` is the deterministic load
order value, and `dependencies` must be present even when empty.

Every generated `package.json.nodics` block must define:

- `kind`: boundary classification such as `project`, `group`, `capability`,
  `server`, `node`, or an existing specialized kind such as `publish` or
  `tooling`.
- `runtimeModule`: whether the package is intended to participate in Nodics
  runtime/module processing.
- `loadableByNodicsModuleLoader`: whether the Nodics module loader may load
  this package.
- `owns`: the explicit ownership list. This list must match generated folders
  and actual behavior. Do not list ownership for folders or capabilities that
  the boundary does not own.
- `runtime`: the runtime surface flags owned by the boundary, including
  `router`, `publish`, and `web`.
- `description`: a concise boundary description for developer and AI tooling.

| Boundary | Required metadata | Required `nodics.kind` | Required ownership guidance | Configuration boundary |
| --- | --- | --- | --- | --- |
| Project root | `groupName` plus standard package fields. `groupName` groups company/customer projects. | `project` | Owns project composition, project defaults, project docs, project LLM guidance, project module catalog, and environment catalog. | Do not put `activeModules` or server coordinates in the project root package. Environment/server selection belongs to startup arguments and layered config. |
| Project module group | Standard package fields. | `group` | Owns child module composition, shared group config/docs/LLM guidance, and source/data/tests only when intentionally present. | Shared defaults may live in `config/properties.js`; concrete behavior belongs to child capability modules unless the group explicitly owns source. |
| Framework group module | Standard package fields. | `group` | Owns framework child composition, shared framework defaults, framework docs, and framework LLM guidance. | Must not declare customer `groupName`, customer topology, or project-specific activation. |
| Capability module | Standard package fields. | `capability` or an existing specialized kind such as `publish` | Owns loader-visible source surfaces listed in `nodics.owns`, module data, tests, docs, and generated context. Provider modules must declare only the provider behavior they actually own. | Provider choice, credentials, tenant selection, and environment/server/node overrides belong in layered configuration. |
| Environment module | Standard package fields. | `group` | Owns deployment-wide environment config/docs/LLM guidance, environment-owned data, and server catalog. | Environment defaults live in `config/properties.js`; process composition belongs to server modules. |
| Server module | Standard package fields. Physical ancestry supplies its environment and canonical identity. | `server` | Owns process composition, active local module selection, server runtime config, server tests, server data, generated reports, and server-level overrides. | `activeModules` belongs in server `config/properties.js`. `servers.*` endpoint coordinates describe local or remote calls; they do not replace activation. |
| Node module | Standard package fields. Physical ancestry supplies its server and canonical identity. | `node` | Owns node id, node-local config, node-level overrides, node tests, diagnostics, and generated node reports. | A node must be physically nested under its server; do not duplicate this relationship in metadata. |

Metadata and folder structure must agree. If `nodics.owns` includes `router`,
the module must expose router ownership through `src/router/routers.js` and
`src/router/appConfig.js` when source is generated. If it includes `pipeline`,
the module must expose `src/pipelines/pipelines.js`. If the boundary does not
own source, data, tests, or generated reports, do not create those folders as
empty decoration.

## Configuration And Activation Matrix

`config/properties.js` is the standard owner for configurable values, policy
defaults, discovery rules, tooling commands, governance data, activation lists,
and runtime coordinates. Do not create sibling configuration files or place
runtime activation inside `package.json`.

Configuration is layered from framework defaults through project, environment,
server, node, tenant, and customer layers. A lower layer may provide defaults,
but a later active layer owns the effective override. When adding or moving a
property, document the intended owner and prove that later layers can override
it without changing out-of-the-box Nodics files.

| Boundary | May configure | Must not configure | Activation rule |
| --- | --- | --- | --- |
| Project root | Project-level defaults that apply before selecting an environment, project documentation settings, project LLM/tooling guidance, and project-wide governance defaults. | `activeModules`, concrete server ports, node ids, provider credentials, tenant/customer secrets, or generated runtime reports. | Project root does not activate process modules. Startup selects environment/server/node, then layered config resolves the effective runtime. |
| Project module group | Shared defaults for related project modules, only when the group is active and intentionally owns those defaults. | Concrete business behavior that belongs to a child capability, server-specific topology, or node-local overrides. | Group config participates only when the group is included by active module selection. |
| Framework group module | Shared framework defaults and framework-owned governance values for child modules. | Customer/project hardcoding, deployment topology, or application-specific provider choices. | Framework group loading is controlled by module hierarchy and active runtime selection; it must remain overrideable by later project layers. |
| Capability module | Capability defaults, service policies, route/security defaults, schema/search/interceptor/pipeline defaults, and provider-neutral extension contracts. | Environment credentials, tenant secrets, server process composition, node ids, or a hardcoded provider choice when multiple providers exist. | Capability behavior becomes active only when its module is part of the active module set for the selected process. |
| Provider module | Provider-specific defaults such as client options, adapter policies, and provider capability switches. | Global provider selection for every project/customer, credentials baked into source, or unrelated provider behavior. | Provider module must be explicitly active or selected through layered configuration; selection must stay overrideable by project/environment/server/node/tenant/customer layers. |
| Environment module | Deployment-wide defaults such as local/dev/UAT/prod policy, environment security compatibility values, cache defaults, test topology expectations, and environment-owned data toggles. | Per-process `activeModules`, concrete node id, reusable capability implementation, or source behavior unless the environment intentionally owns an override. | Environment config is selected by startup/topology and then inherited by its server modules. |
| Server module | `activeModules`, process composition, server runtime flags, ports, local/remote endpoint coordinates under `servers.*`, process-level logging/search/cache/cron/EMS settings, server data toggles, and generated report location. | Environment-wide policy, node-local id/diagnostics, project module catalog, or reusable framework/provider behavior. | Server `activeModules.groups` and `activeModules.modules` decide what runs in the current process. `servers.*` coordinates only describe how this process calls endpoints. |
| Node module | `nodeId`, node-local endpoint overrides, node diagnostics, node runtime overrides, and node-specific test/report settings. | Server-wide active module composition, environment-wide data, project catalog, or reusable source implementation. | Node config refines the selected server process. It must not replace server activation. |

Secrets and credentials must be injected through governed secret configuration
or environment variables and documented as deployment overrides. Local sample
compatibility values may exist only in sample/local project layers and must say
that deployments must override them.

Activation, endpoint routing, and provider selection are separate contracts:

- `activeModules` decides which local modules load into the current process.
- `servers.*` describes local or remote coordinates for communicating with
  processes.
- Provider selection chooses an implementation for a capability and must remain
  layered and overrideable.
- Tenant/customer context may refine behavior after process startup, but it
  must not become a hidden source of module activation.

## Stepwise Generation Rule

Before generating a project with environments, servers, or nodes, propose the
hierarchy first:

1. Project root and `groupName`.
2. Project-owned module groups and capability modules.
3. Environment modules and their deployment-wide responsibilities.
4. Server modules and their active local process composition.
5. Node modules and their instance-specific overrides.
6. Index/order values, parent relationships, and verification commands.

Only after the hierarchy is approved should files be generated. This prevents
AI tools and developers from inventing structure that later conflicts with
Nodics module loading, configuration precedence, generated artifacts, or runtime
governance.

## Generation Checklist Matrix

Use this checklist after the hierarchy proposal is approved. A generator,
developer, or AI tool must create only the files that the approved boundary
owns, then run the matching validation commands. Generated structure is not
complete until metadata, folders, configuration, source definitions, tests,
documentation, and generated context agree with each other.

| Boundary | Before writing files | Generate after approval | Do not generate | Minimum validation |
| --- | --- | --- | --- | --- |
| Project root | Confirm project name, `groupName`, project module catalog, environment catalog, ownership summary, and whether project composition tests are required. | Root files, `config/`, `docs/`, `llm/`, `modules/`, `envs/`, and optional project composition `test/`. | Empty `src/`, empty `data/`, server/node generated reports, environment/server/node files before topology approval. | `npm run test:module-metadata`, `npm run test:topology` when topology exists, `npm run llm:generate`, `npm run llm:validate`. |
| Project module group | Confirm child module names, ordering/index values, shared defaults, and whether the group owns executable behavior. | Root files, `config/`, `docs/`, `llm/`, child module folders, and optional `src/`, `data/`, `test/` only for owned behavior. | Empty data/source/test folders when the group only aggregates children. | `npm run test:module-metadata`, `npm run docs:coverage:source -- --limit=20`, `npm run llm:generate`, `npm run llm:validate`. |
| Framework group module | Confirm framework child modules, ordering/index values, shared framework defaults, and no customer/project-specific behavior. | Root files, `config/`, `docs/`, `llm/`, child module folders, and optional shared source/data/tests only when framework-owned. | Customer topology, project `groupName`, project `envs/`, project module catalogs. | `npm run test:module-metadata`, `npm run test:tooling`, `npm run docs:coverage:source -- --limit=20`, `npm run llm:validate`. |
| Capability module | Confirm capability contract, owner layer, source surfaces, data ownership, override path, provider neutrality, and tests for default plus override/customization behavior. | Root files, `config/`, `docs/`, `llm/`, owned `src/` directories, owned `data/`, owned `test/`, and generated artifacts only from source definitions. | Environment/server/node topology folders, hardcoded provider selection, copied framework files for one-method changes, behavior outside loader-visible paths. | `npm run test:module-metadata`, targeted module tests, `npm run docs:coverage:source -- --limit=20`, `npm run llm:generate`, `npm run llm:validate`. |
| Provider module | Confirm provided capability, provider-specific config keys, selection mechanism, credential boundary, and fallback/default behavior. | Capability-style root files plus provider-owned `src/`, config defaults, tests, docs, and LLM guidance. | Global project/customer provider selection, credentials in source, unrelated provider behavior. | Targeted provider tests, integration governance checks when available, `npm run test:module-metadata`, `npm run llm:validate`. |
| Environment module | Confirm environment purpose, deployment-wide defaults, server catalog, environment-owned data, and topology tests. | Root files, `config/`, `docs/`, `llm/`, server module folders, optional environment `data/` and `test/`. | Per-process `activeModules`, node ids, reusable capability implementation, empty `src/` unless real environment override is approved. | `npm run test:topology`, `npm run test:topology:consolidated`, `npm run test:topology:modular` when applicable, `npm run llm:validate`. |
| Server module | Confirm process role, local active groups/modules, runtime flags, endpoint coordinates, data ownership, node list, and startup/API/internal-communication tests. | Root files, `config/`, `docs/`, `llm/`, server-owned `src/`, `data/`, `test/`, `generated/`, and child node modules when approved. | Project `modules/`, project `envs/`, environment-wide policy, node-local ids in server-independent files. | `npm run test:topology`, targeted startup/API tests, targeted internal communication tests, `npm run docs:coverage:source -- --limit=20`, `npm run llm:validate`. |
| Node module | Confirm parent server, node id, node-specific overrides, diagnostics/report ownership, and node validation tests. | Root files, `config/`, `docs/`, `llm/`, optional node-owned `src/`, `data/`, `test/`, and `generated/`. | Server-wide `activeModules`, environment-wide data, child server/env folders, reusable capability implementation. | Targeted node/topology tests, `npm run test:topology` when topology changes, `npm run llm:validate`. |

For every generated or changed boundary:

1. Keep `package.json.nodics.owns` aligned with the generated folders and
   behavior.
2. Put configurable values in `config/properties.js`; do not add parallel
   config files.
3. Keep runtime behavior in loader-visible folders and mergeable
   `module.exports` object members.
4. Add file-level documentation and standard headers to every source file.
5. Add or update override/customization tests for every new or changed
   extension point.
6. Regenerate generated artifacts from source definitions and regenerate LLM
   context before declaring the boundary complete.

## Folder Matrix

Use this matrix to decide which folders to generate for each boundary. Required
means the folder or file must exist when creating that boundary. Conditional
means generate it only when the boundary owns that kind of behavior, data, or
verification. Prohibited means do not generate it as an empty placeholder.

| Boundary | Required root files | Required folders | Conditional folders | Do not generate empty |
| --- | --- | --- | --- | --- |
| Project root | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/`, `modules/`, `envs/` | `test/` for project composition contracts only | `src/`, `data/`, server/node `generated/` |
| Project module group | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/` | child module folders, `src/`, `data/`, `test/` only when the group owns behavior/data/tests | `data/` when the group only aggregates children |
| Framework group module | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/` | child module folders, `src/`, `data/`, `test/` only when the group owns shared behavior/data/tests | customer/project folders, project-specific `envs/` |
| Capability module | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/` | `src/`, `data/`, `test/`, `generated/` when the capability owns source, records, tests, or generated runtime artifacts | topology folders such as `envs/`, server/node folders |
| Environment module | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/` | server module folders, `data/`, `test/` for environment-owned data/topology validation | `src/` unless the environment owns real source overrides |
| Server module | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/` | node module folders, `src/`, `data/`, `test/`, `generated/` for process-owned overrides, data, tests, and runtime reports | project `modules/`, project `envs/` |
| Node module | `package.json`, `nodics.js`, `AGENTS.md`, `README.md` | `config/`, `docs/`, `llm/` | `src/`, `data/`, `test/`, `generated/` for node-specific overrides, records, diagnostics, or reports | child environment/server folders |

Every generated boundary that includes `config/` must include
`config/properties.js`, `config/prescripts.js`, and `config/postscripts.js`.
Every generated boundary that includes `llm/` must include `llm/README.md`,
`llm/contracts/README.md`, `llm/examples/README.md`, and an empty or generated
`llm/generated/` target according to the module context generation contract.
Every generated boundary that includes `docs/` must include `docs/README.md`.

## Source Folder Matrix

Generate `src/` only when the boundary owns loader-visible source definitions,
runtime behavior, or intentional source extension points. When `src/` is
generated for a capability, server, node, or behavior-owning group, use the
standard source directories below.

| Source path | Generate when | Standard file(s) |
| --- | --- | --- |
| `src/event/` | The boundary contributes event listeners. | `listeners.js` |
| `src/pipelines/` | The boundary contributes pipeline definitions. | `pipelines.js` |
| `src/router/` | The boundary contributes routes or route app configuration. | `routers.js`, `appConfig.js` |
| `src/schemas/` | The boundary contributes schema definitions. | `schemas.js` |
| `src/search/` | The boundary contributes search index definitions. | `indexes.js` |
| `src/interceptors/` | The boundary contributes lifecycle/interceptor definitions. | `interceptors.js` |
| `src/service/` | The boundary contributes services, tooling services, or service overrides. | `**/*Service.js`; module creation may add optional blank `defaultSampleService.js` |
| `src/controller/` | The boundary exposes request controllers. | `**/*Controller.js` |
| `src/facade/` | The boundary exposes facade/orchestration behavior. | `**/*Facade.js` |
| `src/utils/` | The boundary contributes utilities, enums, or status definitions. | `utils.js`, `enums.js`, `statusDefinitions.js` |
| `src/lib/` | The boundary owns class-based libraries. | Class files with file-level documentation |

Do not generate `src/` for a pure project root or pure group module just to
make the tree look complete. Empty source directories are allowed only when
they contain the standard blank registry file and the boundary intentionally
owns that extension point.

## Data Folder Matrix

`data/` belongs to the concrete boundary that owns the records.

| Data path | Owner | Load/use contract |
| --- | --- | --- |
| `data/init/` | Capability, environment, server, or node that owns startup/bootstrap records. | Loaded during startup only when initialization is required. |
| `data/core/` | Capability, environment, server, or node that owns reference records. | Imported intentionally through nData import APIs. |
| `data/sample/` | Capability, environment, server, or node that owns demo/sample records. | Imported intentionally through nData import APIs. |

Project roots and pure group modules must not generate empty `data/` folders.
If data looks project-wide, place it under the environment/server/module that
actually owns the tenant, topology, or capability records.

## Runtime And Data Ownership Matrix

Runtime output, persisted data, diagnostics, and generated context must be
owned by the boundary that can explain, regenerate, validate, activate, or roll
back the artifact. Do not place runtime artifacts at a higher boundary just
because that folder is convenient.

| Artifact or data type | Owner | Source of truth | Runtime rule |
| --- | --- | --- | --- |
| Generated OpenAPI contracts | Active server or node module. | Effective schema and router definitions from active modules. | Regenerate from source definitions; do not hand-maintain OpenAPI output. |
| Generated governance reports | Active server or node module. | Effective runtime hierarchy, schema/router/service/facade/controller/pipeline inventory, and governance services. | Disposable generated output used for diagnostics and review evidence. |
| Generated LLM context | The module whose source/docs/contracts are summarized. | Module-owned source, README, AGENTS, docs, contracts, examples, tests, and metadata. | Regenerate after source, docs, metadata, or extension contracts change. |
| Generated services/facades/controllers/tests | The capability module that owns the source schema or route definition, unless runtime generation is server/node-scoped by design. | Schema/router/source definitions. | Generated output is not source of truth and must keep traceability to the source definition. |
| Startup/init data | Capability, environment, server, or node that owns the bootstrap record. | `data/init/` plus initializer/import source definitions. | Load only when initialization is required and guard with duplicate/idempotency behavior. |
| Core/reference data | Capability, environment, server, or node that owns the reference records. | `data/core/` plus import definitions. | Import intentionally through nData APIs; do not treat as automatic startup data unless explicitly governed. |
| Sample/demo data | Capability, environment, server, or node that owns the example records. | `data/sample/` plus import definitions. | Import intentionally for demos/tests; never make sample data a production dependency. |
| Import run history and diagnostics | nData import capability and the active runtime boundary that ran the import. | Import services, generated import run schema/service, and diagnostic services. | Persist sanitized status, counts, failures, checksums, retry/rollback metadata, tenant, and module context without blocking the import flow. |
| Runtime diagnostics and reports | The server or node that executed the runtime behavior, with capability-level services contributing structured diagnostics. | Runtime services and report generators. | Store under the active server/node generated-report location; sanitize security-sensitive values. |
| Tenant/customer runtime overrides | Runtime governance capability plus the tenant/customer context that owns the override. | Governed runtime configuration, tenant context, activation/audit records, and owning services. | Tenant/customer context may refine effective behavior but must not secretly activate modules or bypass the selected server/node topology. |
| Versioned publishable data | Versioned data capability and provider implementation, plus the module/schema that declares the record publishable. | Versioned schema metadata, vDatabase/provider persistence, vService-generated behavior, approval/publish/audit records. | Persist draft, validated, approved, published, previous, and rollback-capable states in the database so business users can revert without source changes. |
| Provider runtime state | Provider module and selected runtime boundary. | Provider config, selected capability implementation, health/diagnostic services. | Keep provider-specific state separate from provider selection; credentials stay in governed secret configuration. |
| Test evidence | The boundary whose behavior is being proven. | Test files, generated reports, and focused command output. | Server startup/API/internal communication evidence belongs to server modules; node evidence belongs to node modules; override evidence belongs to the overriding module. |

Generated artifacts must never become hidden authority. If an artifact cannot
be regenerated from metadata, source definitions, layered configuration, data
definitions, or runtime governance records, treat the design as incomplete.

Versioned and publishable business data has a stricter contract:

- schemas declare whether records are versioned or publishable;
- business users create or edit draft data in the database;
- validation and approval happen before publish;
- publish creates a durable published state while preserving previous state;
- rollback restores a previous governed version through the owning service;
- audit records capture actor, tenant/customer context, correlation id,
  previous state, requested state, and result;
- provider modules persist versioned data according to their storage contract
  without changing the provider-neutral capability contract.

When deciding where data belongs, ask which boundary can answer these
questions: who creates it, who loads it, who validates it, who can override it,
who audits it, who can roll it back, and which tests prove those behaviors.

## Generator Alignment Rule

Nodics structure generation must use `structure:generate` through the standard
nTooling command path. Public aliases such as `generate:app`, `generate:group`,
`generate:module`, `generate:env`, `generate:server`, `generate:node`, and
`generate:provider` must produce scaffolds that pass `npm run structure:audit
-- --fail` before business behavior is added.

Generators must not copy retired `nCommon/templates`, create retired
`router.js` or `pipelinesDefinition.js` files, write behavior outside
loader-visible folders, or create source/data/test folders that are not backed
by `package.json.nodics.owns`. If a generated boundary needs different
ownership, pass explicit generation options and keep metadata, folders,
configuration, tests, docs, and generated LLM context aligned.

## Topology Planning Rule

Full project topology generation must be plan-first. Use
`npm run structure:plan` to print the proposed project, capability modules,
provider modules, environment modules, server modules, node modules, index
values, filesystem paths, and server-owned `activeModules` placement without
writing files. Use `--apply` only after the hierarchy is approved.

The applied topology must be generated through the same structure generator and
must pass `npm run structure:audit -- --fail`. A planner may propose validation
commands and active module lists, but it must not silently create modules,
invent provider selections, or hide server/node topology decisions.

## Compliance Audit Rule

Run `npm run structure:audit` after generating or reorganizing project,
environment, server, node, group, capability, or provider modules. The command
checks module metadata, required root files, configuration files, LLM/docs
entries, standard source registries, service/controller/facade loader suffixes,
retired `router.js` and `pipelinesDefinition.js` files, `nodics.owns`
alignment, project-root runtime folders, and `activeModules` placement.

The audit is report-only by default so large refactoring batches can inspect
gaps before changing source. Use `npm run structure:audit -- --fail` when a
change gate should reject remaining errors or warnings. Use
`npm run structure:audit -- --include-root` only when the selected project home
is itself intended to be audited as a project boundary; the framework
repository wrapper is not treated as a generated module boundary by default.

Audit results are evidence, not authority. If the audit reports a gap, fix the
source-of-truth metadata, folder, configuration, source definition, or test that
owns the problem rather than suppressing the report.
