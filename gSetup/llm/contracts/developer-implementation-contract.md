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

## Provider Implementation Contract

When adding a new implementation behind an existing capability, such as an
Oracle database adapter for `nDatabase`, a Solr adapter for `nSearch`, a new
cache engine for `nCache`, or a new messaging provider for `nEms`, implement it
as a provider module or project module before changing framework call sites.

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

Do not infer current behavior from secondary notes or older documentation.
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

## Reference Material Use

Use older notes and extracted documentation only as recovery material for
developer-facing concepts and documentation structure:

- Getting Started
- Nodics Structure
- Framework modules
- Platform capabilities
- Core modules
- generated layers
- customization/generalization patterns

Before publishing or implementing from reference material, reconcile each topic
with current source code and current contracts.
