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

`nCommon` is not the hierarchy owner. It contributes shared runtime primitives,
status definitions, processors, interceptors, and utilities after `nConfig` has
prepared the runtime hierarchy and effective configuration.

## Layered Configuration

Each active module may contribute configuration. Later modules may override
earlier defaults without editing out-of-the-box framework code.

Framework defaults belong in framework modules. Project, environment, server,
and node-specific values belong in later modules. Tenant-specific behavior must
be resolved through tenant-aware runtime context or governed runtime
configuration.

Do not add a new configuration loader when an existing `nConfig` loader,
resolver, or runtime governance service owns the behavior.

Plain layered configuration and governed artifacts use different composition
contracts. `config/properties.js`, script maps, utility maps, and many named
service/facade/controller/pipeline contributions use ordinary layered merge by
active module order. Schemas, routers, and their runtime persisted
contributions use governed merge helpers with override metadata, removals,
warnings, and traceability. Do not replace these with one generic merge rule.

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

The selected runtime sequence is always:

1. environment group;
2. selected environment/server-root;
3. selected server;
4. selected node, when a node is selected.

`nConfig` validates that each child points to the previous layer through raw
module parent metadata. Concrete runtime layers from environment/server-root to
server to node must also sort in parent-to-child index order. Environment group
containers may use grouping indexes and are validated by parent relationship and
kind rather than concrete runtime load order. This sequence is independent of
package names.

Active modules are resolved from the framework group, configured active groups
and modules, the selected node, parent modules, and required modules. They are
then loaded by deterministic dotted `index` order.

`activeModules` is the local process activation contract. It decides which
modules are loaded in the current runtime and may contribute configuration,
schemas, routers, services, pipelines, data, tests, and lifecycle behavior.

`server.*` entries are endpoint coordinates. They describe where a local or
remote module can be reached by HTTP/node communication, but they must not
activate the module locally. For example, a modular workflow server may define
`server.profile` so it can call the profile process without loading the profile
module into the workflow process.

## Environment, Server, And Node Responsibilities

Environment modules own deployment-scope defaults for one runtime environment.
They are the right place for environment-wide module groups, endpoint defaults,
data/search/cache toggles, diagnostics posture, and topology test declarations
that apply to every server in that environment.

Server modules own one runnable process composition. They select the local
modules for that process through `activeModules`, define `server.default`
coordinates for the process itself, and may define `server.<module>` endpoint
coordinates for remote modules the process must call.

Node modules own instance-specific overrides under a selected server. They are
for per-node coordinates, worker identity, node-local scheduling, publisher or
consumer ownership, diagnostics, and capacity choices. A node module must remain
a child of the selected server and should not redefine the whole server
composition when a smaller node override is enough.

These responsibilities are based on `package.json.nodics.kind` and parent
relationships. A module does not become an environment, server, or node because
its name contains those words.

Raw package discovery may report a full parent chain for diagnostics. Active
runtime expansion intentionally stops at the selected environment boundary so
project/application containers are not activated as capability modules.

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
