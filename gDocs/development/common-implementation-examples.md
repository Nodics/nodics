# Common Implementation Examples

This guide explains how to implement common Nodics changes without guessing where code belongs.

Use it when you need to create an API, create or change a schema, add a provider implementation, create a scheduled job, or change runtime configuration.

The same rule applies to every example:

```text
Capabilities are sacred; implementations are negotiable.
```

That means the capability contract must stay stable, while the implementation can come from framework modules, project modules, provider modules, environment modules, server modules, node modules, tenant configuration, or runtime governance.

## How To Use These Examples

Each example follows the same beginner-friendly pattern:

1. Identify the business or platform capability.
2. Choose the owning module or later project layer.
3. Put each part of the change in the correct Nodics layer.
4. Keep configuration in `config/properties.js`.
5. Keep behavior in `src/service`.
6. Keep API request mapping in `src/controller`.
7. Keep orchestration in `src/facade`.
8. Keep route metadata in `src/router/routers.js`.
9. Keep data definitions in `src/schemas/schemas.js`.
10. Add tests and regenerate generated artifacts.

If an AI tool is helping, ask it to explain these ten points before it writes
code. That makes the implementation easier to review and prevents new behavior
from landing in a random helper file.

## Quick Placement Map

| Change | Main files |
| --- | --- |
| New API | `src/router/routers.js`, `src/controller`, `src/facade`, `src/service`, tests |
| New data model | `src/schemas/schemas.js`, `src/search/indexes.js` if searchable, tests |
| New provider | Provider module `config/properties.js`, `src/service`, DAO/adapter files, tests |
| New scheduled job | CronJob data/config, job service, optional pipeline/event hooks, tests |
| New import rule | Import pipeline, interceptor, service, config, tests |
| New cache behavior | Cache properties, route/schema/service cache metadata, invalidation tests |
| New tenant-specific behavior | Tenant/runtime configuration plus tenant-aware service tests |
| New documentation route or API contract behavior | Router metadata, OpenAPI generation, Swagger/docs tests |

## Before You Start

Describe the requirement in one sentence:

```text
This change allows <user or system> to <do something> so that <business outcome>.
```

Then answer:

- Which module owns this capability?
- Is this framework behavior or project-specific behavior?
- Is the change tenant-specific, environment-specific, server-specific, or node-specific?
- Is this source behavior, generated behavior, configuration, data, documentation, or tests?
- Which extension point lets a project change this later without editing framework files?

Do not write code until the owner and layer are clear.

## Example Review Questions

Before accepting a change from a human developer or AI tool, ask:

- Did it name the owning module?
- Did it avoid changing framework code for project-specific behavior?
- Did it use standard folders and `module.exports`?
- Did it keep permissions visible in route metadata?
- Did it keep tenant-sensitive behavior tenant-aware?
- Did it update generated artifacts when schemas or routes changed?
- Did it include tests for success, failure, permission, tenant, and override behavior where relevant?
- Did it update public docs, module README, and LLM context when behavior changed?

## Example 1: Create A New API

Use this when an external system, UI, service account, or user needs to call Nodics.

Typical files:

- `src/router/routers.js` for route metadata.
- `src/controller` for request and response mapping.
- `src/facade` when orchestration crosses service or module boundaries.
- `src/service` for business behavior.
- `config/properties.js` for permissions, policy defaults, limits, and feature flags.
- `test` for route, controller, service, permission, and tenant tests.

Implementation flow:

1. Choose the owning module.
2. Define the route, method, permission, tenant behavior, and controller action.
3. Add controller mapping.
4. Add facade orchestration when needed.
5. Add service behavior using the standard `module.exports` function style.
6. Add or update schema definitions if the API stores new data.
7. Add tests for success, validation failure, permission failure, tenant behavior, and override behavior.
8. Regenerate documentation or generated artifacts when route/schema definitions change.

Verification:

```bash
npm run test:suite -- --suite=route-contracts
npm run test:generated
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Beginner checklist:

- The route has a clear URL and HTTP method.
- The route has `secured`, `accessGroups`, permission or `permissionConfig`,
  and `apiExposure` when sensitive.
- The controller only maps request data into Nodics context.
- The service owns the business behavior.
- Swagger/OpenAPI reflects the route after `npm run docs:openapi`.

## Example 2: Create Or Change A Schema

Use this when a feature needs a new model, field, generated CRUD API, import/export target, or searchable data.

Typical files:

- `src/schemas/schemas.js` for schema definitions.
- `src/search/indexes.js` for search index definitions.
- `src/utils/enums.js` for controlled value lists.
- `src/utils/statusDefinitions.js` for lifecycle states.
- `src/interceptors` for lifecycle protection.
- `src/service` for business rules.
- `test` for generated and focused behavior.

Implementation flow:

1. Choose the module that owns the business meaning of the data.
2. Add or update the schema definition.
3. Add indexes, status definitions, enums, interceptors, services, import/export definitions, or access policy only when the schema needs them.
4. Rebuild generated artifacts.
5. Add tests for generated CRUD behavior, required fields, tenant isolation, access policy, import/export, search, and override behavior.
6. Update module README and public docs when the data model is user-facing.

Verification:

```bash
npm run clean
npm run build
npm run test:generated
npm run test:basic
npm run docs:openapi
npm run llm:generate
npm run llm:validate
```

Never edit generated model, API, or test files as the source of truth. Change the source schema and regenerate.

Beginner checklist:

- The schema belongs to the module that owns the business meaning.
- Required fields, defaults, enums, and validators are documented.
- Generated CRUD APIs are enabled only when they should be exposed.
- Import/export/search behavior is updated when the schema participates in those flows.
- Project overrides have tests based on the effective schema, not only the framework default.

## Example 3: Add A Provider Implementation

Use this when a project needs a new database, cache engine, search engine, message broker, storage provider, email provider, payment gateway, or external adapter.

Typical files:

- provider module `package.json` and `nodics.js`;
- provider module `config/properties.js`;
- provider services under `src/service`;
- provider-specific handlers, DAOs, exporters, indexers, or adapters;
- provider tests under `test`;
- provider README and LLM context.

Implementation flow:

1. Identify the provider-neutral capability module, such as database, search, cache, or messaging.
2. Put provider-specific behavior in a provider module or project module.
3. Add provider activation and connection defaults in `config/properties.js`.
4. Keep endpoints, credentials, database names, queue names, indexes, pools, retry policy, and secret paths out of source code.
5. Implement provider behavior through the existing capability contract.
6. Add deterministic tests that do not require live external infrastructure.
7. Add optional live-provider tests behind an explicit integration or release gate.
8. Document how projects activate and override the provider.

Verification:

```bash
npm run test:config
npm run test:basic
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Do not make normal basic tests depend on live Redis, Kafka, Oracle, Elasticsearch, or any other external provider.

Beginner checklist:

- Generic business services do not call the provider library directly.
- Provider credentials and endpoints are configuration, not hardcoded strings.
- Provider-specific behavior is isolated behind a provider module or project provider module.
- Deterministic tests run without live infrastructure.
- Optional live tests are clearly gated.

## Example 4: Create A Scheduled Job

Use this when work must run periodically, such as cleanup, retries, notifications, imports, exports, synchronization, or batch processing.

Typical files:

- `config/properties.js` for schedule defaults, enablement, retry, and node responsibility.
- module-owned data for baseline CronJob records when needed.
- `src/service` for job behavior.
- `src/pipelines`, `src/interceptors`, or `src/event` when the job is part of a larger process.
- `test` for schedule, service, tenant, topology, and failure behavior.

Implementation flow:

1. Choose the module that owns the scheduled business process.
2. Define schedule, enablement, retry, and node/server responsibility.
3. Add job behavior in a loader-visible service.
4. Call existing Nodics services for import/export/search/cache/events instead of direct provider libraries.
5. Add diagnostics and audit where the job changes data.
6. Add tests for disabled behavior, responsible-node behavior, success, failure, retry, tenant behavior, and override behavior.

Verification:

```bash
npm run test:cronjob
npm run test:basic
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Run topology tests when the job must behave differently across multiple servers or nodes.

Beginner checklist:

- The job has a clear owner and purpose.
- The schedule and enablement are configurable.
- Node responsibility is explicit when multiple nodes can run.
- Job behavior uses services instead of direct provider calls.
- Failure, retry, audit, and tenant behavior are tested.

## Example 5: Change Runtime Configuration

Use this when behavior should change by project, environment, server, node, tenant, or runtime activation.

Typical files:

- `config/properties.js` for default property ownership.
- runtime governance services when the value is mutable after deployment.
- tests for property resolution and runtime activation.
- module README and public docs when the setting affects users or operations.

Implementation flow:

1. Identify the owning module and property namespace.
2. Add or update the default value in `config/properties.js`.
3. Resolve the property through existing configuration or runtime governance services.
4. Add validation for shape, type, range, tenant scope, and secret safety.
5. Add preview, approval, activation, audit, and rollback when the setting is mutable in production.
6. Add tests for default resolution, project/environment/server/node override resolution, tenant override resolution, invalid values, and rollback.

Verification:

```bash
npm run test:config
npm run test:dynamo
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Do not create parallel configuration files when the value belongs in `config/properties.js`.

Beginner checklist:

- The property namespace belongs to the module that owns the capability.
- Defaults are source-controlled.
- Mutable runtime changes use preview, approval, activation, audit, and rollback when required.
- Secret values are not stored in source-controlled configuration.
- Tests prove default, override, invalid, and rollback behavior.

## Common Verification Checklist

Before committing a functional change, run the smallest relevant test first and then the governance checks required by the change:

```bash
npm run ai:validate
npm run ai:principle-audit
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Use broader suites such as `npm run test:basic`, `npm run test:full`, or release-grade integration gates when the change affects shared framework behavior, topology, external providers, generated artifacts, security, tenant isolation, or runtime governance.

## What To Avoid

Avoid:

- changing framework files for customer-specific behavior;
- creating custom folders that Nodics loaders cannot see;
- hardcoding permissions, provider choices, endpoints, credentials, schedules, or policy values;
- bypassing services, facades, pipelines, interceptors, or runtime governance;
- editing generated artifacts manually;
- adding behavior without tests;
- updating public behavior without updating documentation and generated LLM context.
