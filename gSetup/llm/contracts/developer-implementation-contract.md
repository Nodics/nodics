# Implementation Contract For Developers And AI Tools

This contract defines current Nodics implementation rules for both human
developers and AI tools.

Use it when a human developer or AI tool is implementing functionality, proposing an
architecture change, writing module guidance, or deciding where a customization
belongs.

Human developers and AI tools follow the same Nodics principles. AI tools do
not get a separate shortcut path, and human developers should not bypass the
same contracts expected from automation.

## Source Perspective

Nodics guidance is organized around how a developer experiences the platform:

- framework defaults
- module groups
- modules
- applications
- environments
- servers
- tenants
- configuration
- schemas
- generated layers
- routers
- processes
- events
- jobs
- tests

That perspective must stay aligned with current source code, security, runtime
governance, and generated LLM context.

## Implementation Decision Order

Before adding or changing behavior, identify the smallest owned layer that can
own the change.

1. Customer/project module
2. Environment, server, or node module
3. Tenant-aware runtime configuration
4. Domain or core capability module
5. Framework module

Prefer the earliest layer in this list that can implement the requirement
without violating the platform contract.

Framework code should change only when the framework capability itself is
missing, incorrect, insecure, ungoverned, or impossible to extend cleanly.

## Extension First

Do not edit out-of-the-box Nodics code when the behavior can be implemented
through an existing extension point.

Check these extension points before proposing framework edits:

- `package.json.nodics` metadata
- `config/properties.js`
- schema definitions
- validators
- interceptors
- generated models
- generated services
- handwritten services
- facades
- controllers
- routers
- pipelines
- process definitions
- process nodes
- event listeners
- cron job definitions
- import/export definitions
- tests
- module-local `AGENTS.md`, `README.md`, `llm/contracts`, and `llm/examples`

If none of these extension points can safely express the behavior, document the
gap and treat the work as framework-maintainer mode.

## Control-Plane API Contract

Control-plane work means backend API/security contract work unless the user
explicitly asks for UI. APIs used by administrators, support tooling, CLI tools,
AI tools, Postman, or a future admin application must be secured at route
metadata level.

Every sensitive control-plane route must declare an action-specific
`permission` or governed `permissionConfig`. Broad access groups such as
`userGroup` may remain as a base authenticated boundary, but they are not
sufficient for operations that inspect or mutate runtime state, files, imports,
exports, logs, schema maintenance, test execution, dynamic classes, cache
operations, runtime configuration, or governance data.

Every topology-sensitive control-plane route must also declare an `apiExposure`
category. The request pipeline checks
`apiExposure.categories.<category>.enabled` before route help, controller
execution, or service behavior. Permissions decide who can call an exposed API;
`apiExposure` decides whether that API category is available in the current
project, environment, server, or node.

When adding or changing a control-plane API:

- choose the owning module and route;
- choose the `apiExposure` category when the route should be gated by topology;
- define the action-specific permission name;
- add it to the permission catalog and the appropriate governed user group;
- update route contract tests and the cross-module control-plane permission
  contract;
- prove disabled categories fail closed before controller execution when
  `apiExposure` applies;
- document the operational and security impact.

## HTTP Hardening Contract

Developers and AI tools must treat CORS, security headers, body parser limits,
rate limits, and proxy trust as router/topology policy. Put defaults and
overrides under `httpHardening` in layered `config/properties.js`, or override
`DefaultHttpHardeningService` in a later active module when the deployment needs
provider-grade behavior.

Do not implement HTTP hardening inside controllers, facades, business services,
schema services, or generated route files. When a new API requires browser,
admin, service-to-service, or external-system access, state whether the existing
server/node `httpHardening` policy is sufficient and add tests for any changed
origin, body-limit, proxy, or rate-limit behavior.

## Bootstrap Secret Contract

Developers and AI tools must not put usable production passwords, API keys, JWT
secrets, API-key peppers, or service credentials into framework source,
initializer data, generated context, logs, tests, or documentation examples.

Active bootstrap identity credentials must come from declared governed sources.
When creating or changing a project/environment/server/node that activates
bootstrap users, define `bootstrapIdentity.source`, `adminPassword`,
`servicePassword`, and `serviceApiKey` through layered configuration or a
secret-backed external source. Production-like sources must be governed values
such as `environment`, `externalProperty`, `secretManager`, or `runtimeSecret`.
Local/test sources such as `localSample` or `test` require the explicit
`authSecurity.compatibility.allowLocalBootstrapIdentity` flag and must not be
used as production defaults.

## Configuration Ownership Contract

Module configuration belongs in `config/properties.js`. Developers and AI tools
must not create parallel configuration files such as `config/tooling.js`,
standalone governance JSON files, command registries, quality-gate files, or
implementation-specific policy files when the value can be represented as a
property subtree.

Use clear property namespaces for specialized concerns, for example
`tooling.commands`, `tooling.discovery`, and
`tooling.documentationGovernance`. A separate file is allowed only when it is a
true source artifact with its own loader contract, schema, generator, or
external override purpose, and the owning module must document why
`config/properties.js` is not the correct home.

Non-runtime tooling must follow the same ownership rule. Tooling commands,
quality gates, discovery exclusions, provider selection defaults, benchmark
thresholds, diagnostics, and governance policy defaults are configuration
unless they are executable service behavior. Executable behavior belongs in
loader-visible services under `src/service`; configuration values belong in
`config/properties.js`.

When a tool needs to read a small property section from modules without loading
the full Nodics runtime, it must still preserve property ownership. Do not
invent a second configuration file just because direct `require()` would execute
runtime-only expressions. Use a safe extractor, a replaceable service, or a
documented runtime-independent property reader for the required property
subtree.

## Dependency And Runtime Contract

Developers and AI tools must follow the root dependency contract before changing
packages or runtime assumptions. The source of truth is root `package.json`,
`.nvmrc`, and `package-lock.json`.

Use Node.js 24 as the preferred release line. Keep Node.js 22 in the supported
validation matrix while it remains supported, and use Node.js 26 only for
forward validation until it becomes an adopted release target. Do not treat
Node.js 25 as a release target.

Use `npm ci` for clean installs, CI, release checks, and verification from a
fresh checkout. Use `npm install` only when intentionally changing dependency
versions or dependency ownership. Commit `package.json` and `package-lock.json`
together for dependency changes, and run the dependency runtime contract plus
the appropriate test/documentation gates before accepting the change.

Root `package.json` is the repository install aggregator. The owning module
`package.json` must also declare the dependency it owns, and root
`nodics.dependencyGovernance.ownedDependencies` must classify the dependency,
owner module, purpose, and restricted-provider boundary. Provider SDKs must
stay inside their owner module or an explicitly allowed test/release consumer.

Use `npm run release:check` to print the clean-checkout release gate before
claiming release readiness. Use `npm run release:check -- --execute` to run the
standard gate and `npm run release:check -- --execute --full` for a release
candidate. Do not invent separate release scripts outside nTooling; extend the
`release:check` tooling command through governed command overrides when a
project needs stricter gates.

## Licensing And Header Contract

Every Nodics-owned JavaScript source file, generated JavaScript file, template
JavaScript file, and generated customer project skeleton file must use the
canonical 2026 Nodics source header. Do not hand-edit one file to use different
legal text. Update the nTooling copyright quality service, structure generator,
tests, documentation, and generated artifacts together.

Markdown documentation does not require the JavaScript block header at the top
of every page, but JavaScript snippets that show Nodics skeletons or source
templates must use the current 2026 header. Run `npm run quality:copyright` and
`npm run quality:copyright:fix` for validation and normalization.

## Provider Implementation Contract

When adding a new implementation behind an existing capability, such as an
Oracle database adapter for `nDatabase`, a Solr adapter for `nSearch`, a new
cache engine for `nCache`, or a new messaging provider for `nEms`, implement it
as a provider module or project module before changing framework call sites.
Apply `integration-governance-contract.md` for ownership, provider selection,
connection/secrets, data flow, tenant/environment/server/node overrides,
security, diagnostics, tests, and MCP exposure boundaries.

Provider guidance must identify:

- the provider-neutral module that owns the capability contract;
- the provider-specific module or project module that owns the implementation;
- layered configuration properties that activate and configure the provider;
- services, handlers, adapters, schemas, routers, pipelines, or events that the
  provider must implement;
- tenant, environment, server, and node override behavior;
- secrets, endpoints, credentials, queue names, index names, database names, or
  topology values that must never be hardcoded;
- tests proving the provider works through the existing capability contract;
- override tests proving a later module can replace or tune the provider;
- documentation and generated LLM context updates.

If the provider cannot be plugged in through existing metadata, configuration,
services, handlers, or adapter contracts, document the missing extension point
and treat that as framework-maintainer work. Do not solve provider onboarding
by bypassing the provider-neutral capability module.

## Source-Of-Truth Rule

AI tools must inspect source-of-truth artifacts before implementing or
explaining behavior.

Use generated LLM context only as a navigation and summary aid. Current behavior
must be confirmed from owned source files, active module metadata, layered
configuration, schema definitions, route contracts, service contracts, tests,
and runtime governance files.

Do not infer current behavior from secondary notes or captured documentation.
Current runtime behavior must come from source-of-truth artifacts and tests.

## Generated Layer Rule

If a layer is generated from definitions, change the definition and regenerate.

Do not hand-maintain generated models, services, facades, controllers, routers,
tests, OpenAPI documents, or generated LLM context as the source of truth.

Every generated artifact must have:

- a source definition
- a regeneration path
- a clean path
- validation that detects stale output when practical

## Module Guide Contract

Each module guide should answer these questions for humans and AI tools:

1. What capability does this module own?
2. Which source definitions control the module?
3. Which services, routers, processes, events, jobs, or tests are generated?
4. Which extension points can later modules override?
5. Which configuration properties affect behavior?
6. How does tenant or request context affect behavior?
7. Which security, access, validation, audit, rollback, diagnostics, and test
   contracts apply?
8. What should a customer project do instead of editing framework code?
9. What should never be hardcoded in this module?
10. Which tests prove default behavior and override behavior?

Module guides belong beside the module that owns the capability. Cross-module
platform rules belong under `gSetup/llm`.

## Capability Contract

An implementation is incomplete if it only makes the happy path work.

Every new or changed feature must preserve the applicable platform capability
contracts:

- layered customization
- active module resolution
- active tenant resolution
- request context propagation
- validation
- access control
- audit and traceability
- rollback or recovery where applicable
- diagnostics and sanitized observability
- generated artifact lifecycle
- consolidated runtime behavior
- modular runtime behavior where cross-module communication is involved
- tests for default and later-loaded override behavior

## Guidance Contract

When guiding implementation, a human developer or AI tool must explain the
Nodics-native path first.

Good guidance names:

- the owning module
- the expected layer
- the source definition to change
- the extension point to use
- the generated artifacts affected
- the test boundary
- the documentation or LLM context update required

Bad guidance jumps directly to editing arbitrary JavaScript files, hardcoding
project names, bypassing loaders, bypassing tenant context, or patching
generated output.

When guidance asks for a service, controller, facade, or pipeline change, it
must name the loader-managed path and canonical file shape. Services use
`src/service/**/*Service.js`, controllers use `src/controller/**/*Controller.js`,
facades use `src/facade/**/*Facade.js`, and pipeline definitions use
`src/pipelines/pipelines.js`. The recommended implementation must export
mergeable object members so the same behavior can be overridden by a later
module with the same artifact name.

When guidance asks for pipeline work, it must also explain the pipeline
lifecycle contract: pipeline definitions own ordered execution, service methods
own each node implementation, processors own targeted data transformation, and
tests must prove default behavior plus the intended later-module override path.
Use `gFramework/nPipeline/docs/pipeline-framework.md` as the canonical
framework guide before adding, extending, or documenting pipeline behavior.

When guidance asks for router work, it must explain the full router contract:
route definitions own HTTP exposure and access metadata, Express app
configuration owns middleware hooks, `DefaultRouterService` registers effective
routes, `DefaultRouterOperationService` binds Express methods, the request
handler pipeline normalizes and secures requests, controllers map request data,
and downstream facades/services/pipelines own business behavior. Use
`gFramework/nRouter/docs/router-framework.md` as the canonical framework guide
before adding, securing, extending, or documenting API routes.

Router guidance must preserve HTTP method semantics. `GET` routes are read-only
and must not mutate state. Commands such as run, start, stop, pause, resume,
publish, import, export, approve, activate, or remove must use command methods
such as `POST`, `PATCH`, or `DELETE` according to the behavior.

## Reference Material Use

Use captured notes and extracted documentation only as recovery material for
developer-facing concepts and documentation structure:

- Getting Started
- Nodics Structure
- Framework modules
- Platform capabilities
- Core modules
- generated layers
- customization/generalization patterns

Before publishing or implementing from planning notes, reconcile each topic with
source code and active contracts.
