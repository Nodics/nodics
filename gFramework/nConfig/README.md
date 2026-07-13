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
