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

When no server name is provided, the current default may use `kickoffLocalServer`, but framework logic should not hardcode this outside default startup configuration.

## Consolidated And Modular Runtime

Nodics supports both:

- consolidated runtime: one server runs many modules together.
- modular runtime: modules run as separate applications/processes and communicate through APIs/events.

Testing should cover both styles when behavior depends on module communication.

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
