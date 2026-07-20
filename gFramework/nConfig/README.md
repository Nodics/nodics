# nConfig

`nConfig` starts Nodics in a predictable way. It answers four beginner
questions before other modules run: which modules are active, in what order,
which configuration wins, and which runtime composition is being started.

`nConfig` owns Nodics startup configuration, active module discovery, metadata
validation, layered property loading, and startup script orchestration.

`nConfig` prepares application, environment, server, node, and property state
before the rest of the platform starts. Runtime selection must come from active
module metadata and layered configuration, not hardcoded project names.

## When To Use This Module

Read or change `nConfig` when you are working on module discovery, package
metadata, configuration precedence, environment/server/node selection, startup
scripts, generated build lifecycle, logging bootstrap, readiness, draining, or
shutdown coordination.

Do not put business rules here. Business behavior belongs to its capability
module; `nConfig` only ensures that the correct modules and configuration are
available to that behavior.

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

## Configuration Loading Process

Configuration loading is one of the first framework jobs.
That is still the right mental model: `nConfig` prepares the runtime before
schema, router, service, data, and process behavior can be trusted.

The current configuration process must:

1. resolve startup arguments and selected topology;
2. discover candidate packages without treating `docs/` as runtime source;
3. validate `package.json` and `package.json.nodics` metadata;
4. resolve active module groups and modules for the selected server/node;
5. sort modules by deterministic `index` order;
6. load layered `config/properties.js`;
7. expose effective properties to downstream services;
8. execute pre-start and post-start script declarations where applicable;
9. preserve diagnostics that explain which module supplied an effective value.

If startup behavior is wrong, fix the metadata, active-module configuration,
properties, or loader contract that owns the problem. Do not add a second
startup path for one project or server.

## Properties Ownership

`config/properties.js` is the standard home for configurable values. It may own
runtime defaults, provider defaults, server coordinates, active module
selection, command declarations, discovery rules, and governance data.

When adding a property, document:

- property path;
- owning module;
- default value;
- valid override layers;
- tenant/runtime governance behavior;
- validation and failure behavior;
- tests proving default and override resolution.

Do not move configurable values to files such as `tooling.js`, standalone
governance JSON, or custom registries when a property subtree can own them.

## Logging And Redaction

`nConfig` creates the central Nodics logger before most framework services are
available. Logger behavior is configured under `log` in layered
`config/properties.js`.

Sensitive log redaction is controlled by `log.redaction`:

```js
module.exports = {
    log: {
        redaction: {
            enabled: true,
            mask: '[REDACTED]',
            sensitiveKeys: ['authorization', 'token', 'password', 'apiKey', 'secret']
        }
    }
};
```

The logger redacts sensitive object fields, authorization strings, API-key or
password key/value text, and connection-string credentials before console, file,
and Elasticsearch transports serialize the log entry. Project, environment,
server, or node modules may add their own sensitive keys through later
`properties.js` contributions.

Redaction is a safety net, not permission to log secrets. Source code must log
safe context such as token type, tenant, operation, correlation id, reason code,
or status. Do not log generated token values, raw passwords, API keys, cookies,
authorization headers, private keys, or usable connection credentials.

## Pre And Post Startup Scripts

`config/prescripts.js` and `config/postscripts.js` are startup extension
points. They declare startup work that belongs before or after normal
module startup behavior.

Use startup scripts for controlled lifecycle hooks, not for hiding business
logic. A script calls a loader-visible service when it needs real behavior, and
that service has tests and documentation.

Startup script changes must describe:

- when the script runs;
- which module owns it;
- whether it is safe to run more than once;
- tenant/default-tenant behavior;
- failure behavior;
- diagnostics;
- tests or startup evidence.

## Runtime Lifecycle And Resilience

Process startup, readiness, draining, shutdown, and provider cleanup follow the
[runtime lifecycle and resilience contract](docs/runtime-lifecycle-resilience-contract.md).
`nConfig` owns the single signal coordinator; later modules contribute bounded
hooks instead of installing parallel process handlers.

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

`servers.*` entries are endpoint coordinates. They describe where a local or
remote module can be reached by HTTP/node communication, but they must not
activate the module locally. For example, a modular workflow server may define
`servers.profile` so it can call the profile process without loading the profile
module into the workflow process.

## Environment, Server, And Node Responsibilities

Environment modules own deployment-scope defaults for one runtime environment.
They are the right place for environment-wide module groups, endpoint defaults,
data/search/cache toggles, diagnostics posture, and topology test declarations
that apply to every server in that environment.

Server modules own one runnable process composition. They select the local
modules for that process through `activeModules`, define `servers.default`
coordinates for the process itself, and may define `server.<module>` endpoint
coordinates for remote modules the process must call.

Node modules own instance-specific overrides under a selected server. They are
for per-node coordinates, worker identity, node-local scheduling, publisher or
consumer ownership, diagnostics, and capacity choices. A node module must remain
a child of the selected server and does not redefine the whole server
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
code must not hardcode sample projects, customer projects, environment names,
server names, node names, tenant names, or deployment assumptions.

When adding configuration behavior, document:

- the property path;
- default value and owning module;
- allowed override layers;
- tenant/request behavior;
- validation and failure mode;
- tests proving default and later-layer override behavior.

## Integration Map

| Consumer or collaborator | Relationship |
| --- | --- |
| Every active module | Supplies metadata, properties, lifecycle scripts, and source contributions loaded in deterministic order. |
| `nCommon` | Uses the prepared runtime to provide shared helpers and error/trace contracts. |
| `nRouter`, `nDatabase`, `nPipeline` | Consume effective definitions and properties after configuration has established the active hierarchy. |
| Environment/server/node modules | Select topology and contribute progressively narrower configuration. |
| `nDynamo` | Governs supported persisted runtime configuration; it does not replace normal startup configuration authority. |
| `nTooling` | Uses configuration-owned command and governance properties for non-runtime build and validation workflows. |

## Security, Performance, And Operations

- Treat configuration and diagnostics as potentially sensitive; redact secrets
  and do not print usable credentials.
- Keep discovery and merge order deterministic so startup behavior can be
  reproduced and audited.
- Keep startup hooks idempotent and bounded. A mandatory failure should stop
  readiness rather than leave a partially trusted runtime.
- Register lifecycle work through the single coordinator instead of installing
  parallel process signal handlers.
- Keep local module activation (`activeModules`) separate from remote endpoint
  coordinates (`servers.*`).

## Verification

```bash
node gFramework/nConfig/test/configurationValidation.test.js
node gFramework/nConfig/test/layeredCustomizationContract.test.js
node gFramework/nConfig/test/nonRuntimePackageDiscovery.test.js
node gFramework/nConfig/test/runtimeLifecycleService.test.js
node gFramework/nConfig/test/loggerRedactionContract.test.js
npm run quality:docs
```

Also validate schema/router override governance when changing composition and
run `npm run test:basic` before release or shared-branch publication.

## Common Mistakes

- Inferring module kind from a folder name instead of `package.json.nodics`.
- Creating another configuration or governance file when `properties.js` owns
  the value.
- Treating endpoint coordinates as local module activation.
- Hiding business work in startup scripts.
- Running generated-context generation and validation concurrently.

## Continue

- Public guide: [How Configuration Works](../../gDocs/configuration/how-configuration-works.md)
- Runtime structure: [How Nodics Is Organized](../../gDocs/architecture/how-nodics-is-organized.md)
- Lifecycle detail: [Runtime Lifecycle And Resilience Contract](docs/runtime-lifecycle-resilience-contract.md)
- Framework map: [gFramework](../README.md)
