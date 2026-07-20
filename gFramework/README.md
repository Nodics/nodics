# gFramework

`gFramework` is the reusable platform foundation underneath a Nodics
application. In plain language, it provides the common machinery for loading an
application, exposing APIs, applying business behavior, working with data,
running ordered processes, enforcing access, and operating the system.

Application teams normally consume these capabilities through project modules.
They should not add customer-specific behavior directly to `gFramework`.

`gFramework` composes the core Nodics capability modules and coordinates their
runtime, clean, build, and generator lifecycles. Runtime behavior comes from the
active metadata-driven module hierarchy and layered configuration; this group
must not contain project-specific selection logic.

After ordinary init data is available, the coordinator executes the enabled,
ordered entries in the merge-friendly `mandatoryBootstrapServices` map. Each
entry names a service implementing an idempotent `reconcile(request)` contract.
Capability and project modules may add, disable, reorder, or replace reconcilers
without editing the coordinator. Reconcilers are expected
to preserve existing customizations, avoid secret generation, provide audit
traceability for mutations, and fail startup when a mandatory contract cannot be
restored safely.

## Start Here

Use this README when you need to understand how the framework capabilities fit
together. Then move to the owning module:

| Need | Owning documentation |
| --- | --- |
| Startup, module discovery, hierarchy, configuration, clean, and build | [nConfig](nConfig/README.md) |
| Shared errors, utilities, enums, processors, and traceability | [nCommon](nCommon/README.md) |
| HTTP routes, request security, OpenAPI, and response handling | [nRouter](nRouter/README.md) |
| Service behavior and module-to-module communication | [nService](nService/README.md) |
| Database capability and provider composition | [nDatabase](nDatabase/README.md) |
| Ordered runtime execution | [nPipeline](nPipeline/README.md) |
| All framework capabilities | [Complete Module Catalog](../gDocs/reference/module-catalog.md#gframework) |

## Documentation Contract

Framework guidance is organized around the owning capability modules, including
`nConfig`, `nCommon`, `nDatabase`, generated DAO/service/facade/controller/router
layers, request handling, cache, messaging, logging, testing, events, and cron
jobs.

Module-specific details belong in each owning module README. Use this group
README only for cross-framework coordination and capability boundaries.

## Capability Boundary

`gFramework` is a group module. It should coordinate framework capability modules, not own project behavior directly.

Framework modules provide default capabilities such as:

- configuration and startup lifecycle;
- module hierarchy and active-module loading;
- schemas, routers, services, facades, controllers, and generated CRUD/API artifacts;
- database, cache, search, messaging, events, pipelines, workflow, data import/export, catalog, publish, validation, token, OTP, and runtime governance support;
- documentation, LLM guidance, quality gates, and non-runtime tooling.

Capabilities are sacred, implementations are negotiable. A project should override behavior through active modules, layered configuration, tenant context, schemas, services, pipelines, data, tests, and governance instead of editing released framework source.

## Runtime Flow

1. `nConfig` discovers active modules and loads layered configuration.
2. Module lifecycle hooks and script extensions run in module order.
3. Definitions such as schemas, routers, pipelines, listeners, validators, and interceptors are composed from active modules.
4. Generated artifacts are created from source definitions during build.
5. Runtime services use tenant, environment, server, node, and project context to resolve effective behavior.
6. Mandatory bootstrap reconcilers restore required platform contracts without destroying customizations.
7. Governance, diagnostics, audit, rollback, and tests protect the capability surface.

## Developer Rule

When changing Nodics, first identify the owning module and artifact type:

- configurable value: `config/properties.js`;
- HTTP/API contract: `src/router`;
- request mapping: `src/controller`;
- orchestration: `src/facade`;
- business behavior: `src/service`;
- ordered process: `src/pipelines`;
- data contract: `src/schemas` and `data`;
- event behavior: `src/event/listeners.js`;
- generated artifact: change source definition, then regenerate;
- AI/developer guidance: `README.md`, `AGENTS.md`, `llm/contracts`, `llm/examples`, and generated context.

This rule applies to human developers and AI tools equally.

## What To Avoid

Avoid:

- adding project behavior to group modules;
- bypassing active module hierarchy;
- hand-maintaining generated artifacts;
- hardcoding provider choices, credentials, tenant mappings, or deployment topology;
- changing runtime behavior without docs, tests, and generated LLM context;
- using private root `docs/` material as product documentation.

## Security, Operations, And Performance

Security and operational behavior is owned by the relevant capability module,
not by this group container. Route exposure and HTTP hardening belong to
`nRouter`; identity and tokens belong to their security modules; database
isolation belongs to `nDatabase/database`; lifecycle and readiness coordination
begin in `nConfig`; transport resilience belongs to `nService`.

Do not solve a cross-cutting concern by adding a second client, loader,
registry, lifecycle handler, or governance source at the group level. First find
the existing capability owner and extend its contract.

## Verification

The group has no independent business API. Verify changes through the focused
tests of the owning child module, then run:

```bash
npm run quality:docs
npm run llm:generate
npm run llm:validate
npm run test:basic
```

## Continue

- Beginner architecture: [How Nodics Is Organized](../gDocs/architecture/how-nodics-is-organized.md)
- Build a capability: [Build Your First Nodics Capability](../gDocs/getting-started/build-your-first-capability.md)
- Module catalog: [Complete Module Catalog](../gDocs/reference/module-catalog.md)
- Public documentation: [Nodics Documentation](../gDocs/README.md)
