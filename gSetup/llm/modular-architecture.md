# Modular Architecture

## Module Hierarchy

Nodics loads active modules in index order. Lower-level framework modules provide default behavior. Later modules can override or extend that behavior.

The hierarchy commonly includes:

- `gFramework`: platform foundation modules.
- `gCore`: core business capabilities such as profile, cronjob, workflow, and NEMS.
- `gComm`, `gContent`, `gDeap`, `gMrkty`: domain capability groups.
- application modules such as `kickoff`: example/test application modules.
- environment/server/node modules under the application: runtime topology and deployment-specific configuration.

`kickoff` is only a sample/test application. Framework code must not depend on it.

## Environment, Server, And Node

Environment, server, and node are different concepts:

- Environment: deployment context such as local, dev, QA, UAT, prod.
- Server: an application composition inside an environment.
- Node: a runtime process under a server.

Use the layers for different decisions:

- Environment modules hold deployment-wide defaults such as environment module
  groups, shared endpoint defaults, feature toggles, diagnostics posture, and
  topology test declarations.
- Server modules hold one runnable process composition, including local
  `activeModules`, the process `server.default` endpoint, and remote
  `server.<module>` endpoints the process must call.
- Node modules hold instance-specific overrides below a selected server, such
  as node identity, node coordinates, scheduler/consumer ownership, diagnostics,
  and capacity choices.

When no server name is provided, the current default may use `kickoffLocalServer`, but framework logic should not hardcode this outside default startup configuration.

The runtime hierarchy is metadata-driven:

- the environment container such as `kickoffEnvs` is a `nodics.kind: "group"` package.
- each concrete environment such as `kickoffLocal` is a `nodics.kind: "environment"` package.
- each runnable server under an environment is a `nodics.kind: "server"` package.
- each runnable node under a server is a `nodics.kind: "node"` package.

The selected runtime sequence is environment group -> environment/server-root
-> server -> optional node. Nodics validates parent relationships for the whole
chain and validates concrete environment/server/node index ordering. Environment
group containers may use grouping indexes, so their role is validated by kind
and parent relationship rather than by concrete runtime load order. Names may be
human-friendly, but they do not define the role.

Every selected environment group, environment, server, and node must provide `config/properties.js`. The startup initializer validates these files, validates parent/child relationships, and validates index order before loading runtime services.

Do not introduce alternate metadata names for the same concept. Nodics module classification belongs in `package.json.nodics.kind`; runtime flags belong in `package.json.nodics.runtime`; ownership belongs in `package.json.nodics.owns`.

## Consolidated And Modular Runtime

Nodics supports both:

- consolidated runtime: one server runs many modules together.
- modular runtime: modules run as separate applications/processes and communicate through APIs/events.

Keep local activation separate from endpoint coordinates. `activeModules.groups`
and `activeModules.modules` decide which modules run inside the current process.
`server.*` entries describe how to reach local or remote module endpoints and
must not be treated as local activation. In modular runtime, a server may define
`server.profile`, `server.nems`, or another module endpoint so it can call that
remote process without loading that module locally.

Testing should cover both styles when behavior depends on module communication.

Topology smoke tests should be configured from the active project/environment, not hardcoded in framework code. The local reference topology uses `test.runtimeTopology` to declare the consolidated server, modular servers, and communication checks. A project such as an eCommerce implementation should define its own topology in its own environment module.

Use these checks when changing startup, module activation, server/node properties, or inter-module communication:

```bash
npm run test:config
npm run test:topology:consolidated
npm run test:topology:modular
```

## Layered Override Targets

Later modules may override:

- configuration properties
- schemas
- generated models/services/routes
- handwritten services
- facades
- controllers
- routers
- pipelines
- interceptors
- validators
- import/export data
- tests
- runtime persisted configuration

Any new feature should be implemented at the correct layer so a project module can replace it without changing core.

## Service, Facade, Controller, Router Pattern

Typical flow:

1. Router defines HTTP contract.
2. Controller maps request input into Nodics request context.
3. Facade owns orchestration/policy boundary.
4. Service owns business behavior.
5. Generated service/model owns schema-driven persistence when applicable.

Do not put database details directly into controllers. Prefer service contracts so behavior remains overrideable.

## Pipelines, Hooks, Events, And Interceptors

Nodics uses dynamic behavior extension points. These are platform capabilities, not accidental complexity.

When modifying pipeline or interceptor behavior:

- preserve execution order
- preserve context propagation
- preserve error traceability
- preserve module ownership metadata
- avoid hardcoded module checks
- add tests for negative and override scenarios
