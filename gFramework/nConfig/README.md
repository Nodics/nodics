# nConfig

`nConfig` owns Nodics startup configuration, active module discovery, metadata
validation, layered property loading, and startup script orchestration.

`nConfig` prepares application, environment, server, node, and property state
before the rest of the platform starts. Runtime selection must come from active
module metadata and layered configuration, not hardcoded project names.

## Ownership

`nConfig` is responsible for:

- resolving startup inputs such as application, environment, server, and node;
- validating `package.json.nodics` metadata;
- loading active modules in declared index order;
- loading and merging `config/properties.js` from active layers;
- preserving framework, project, environment, server, node, and tenant
  override behavior;
- coordinating pre-start and post-start script definitions where applicable;
- exposing effective configuration through governed framework services.

## Layered Configuration

Each active module may contribute configuration. Later modules may override
earlier defaults without editing out-of-the-box framework code.

Framework defaults belong in framework modules. Project, environment, server,
and node-specific values belong in later modules. Tenant-specific behavior must
be resolved through tenant-aware runtime context or governed runtime
configuration.

Do not add a new configuration loader when an existing `nConfig` loader,
resolver, or runtime governance service owns the behavior.

## Metadata Contract

`package.json.nodics` is the module manifest. Nodics metadata belongs under
that object, including kind, runtime flags, ownership, and loader behavior.

Do not introduce parallel metadata files or alternate names for the same
concept. Module classification belongs to `nodics.kind`; runtime activation
belongs to `nodics.runtime`; ownership belongs to `nodics.owns`.

## Runtime Hierarchy

Nodics runtime hierarchy is metadata-driven. Directory names and naming suffixes
may help humans, but they must not decide module behavior.

The selected runtime is resolved from package metadata and parent relationships:

- `application` packages represent a project or product boundary.
- `group` packages organize modules or environments and may expand active
  module lists.
- `environment` packages represent deployable environment roots such as local,
  development, QA, pre-production, or production.
- `server` packages represent a concrete runtime process selected by startup
  options or `S=` / `SERVER=`.
- `node` packages represent optional instance-specific overrides below a
  selected server.

Configuration precedence for the selected runtime is:

1. environment group configuration;
2. selected environment/server-root configuration;
3. selected server configuration;
4. selected node configuration, when a node is selected.

Active modules are resolved from the framework group, configured active groups
and modules, the selected node, parent modules, and required modules. They are
then loaded by deterministic dotted `index` order.

Do not write framework logic that depends on names ending in `Env`, `Server`,
`Node`, or any project-specific prefix. Use `package.json.nodics.kind`, parent
relationships, runtime flags, configured active modules, and module indexes.

## Extension Contract

Projects customize configuration by contributing later modules with their own
`config/properties.js`, metadata, scripts, tests, and documentation. Framework
code must not hardcode `kickoff`, customer projects, environment names, server
names, node names, tenant names, or deployment assumptions.

When adding configuration behavior, document:

- the property path;
- default value and owning module;
- allowed override layers;
- tenant/request behavior;
- validation and failure mode;
- tests proving default and later-layer override behavior.
