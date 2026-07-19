# Nodics Principles

## Product Intention

Nodics is an enterprise-grade Node.js application platform inspired by SAP Hybris/SAP Commerce, ATG/Oracle Web Commerce, and Demandware. It is designed for organizations that need to build large, customizable business systems while keeping the core framework upgradeable.

The platform should support product, commerce, content, workflow, eventing, data import/export, runtime configuration, generated APIs, modular deployment, and admin/control-plane governance.

## Non-Negotiable Rule

Capabilities are sacred; implementations are negotiable.

Modernization may replace outdated libraries, improve security, refactor existing code, add validation, add tests, and improve diagnostics. It must not remove enterprise platform capabilities because they are complex.

## Architecture Rules

1. Treat Nodics as a configurable enterprise application platform and application factory.
2. Preserve layered module hierarchy and override behavior.
3. Keep framework behavior generic; never hardcode customer/project modules into framework logic.
4. Put source definitions in modules; regenerate derived artifacts during build.
5. Keep generated artifacts safely removable by clean.
6. Use service/facade/controller/router boundaries consistently.
7. Keep runtime artifacts inside Nodics loader radar: services under `src/service/**/*Service.js`, controllers under `src/controller/**/*Controller.js`, facades under `src/facade/**/*Facade.js`, and pipeline definitions in `src/pipelines/pipelines.js`.
8. Export runtime behavior as mergeable `module.exports = { methodName: function (...) {} }` objects so later modules can override the smallest necessary member.
9. Use schema-driven models, services, routers, APIs, tests, and documentation where possible.
10. Preserve multi-tenancy, tenant data placement, and the difference between default tenant and active tenant.
11. Preserve runtime configuration, audit, rollback, validation, and access-control governance.
12. Add tests for both consolidated and modular deployment behavior when behavior crosses module/process boundaries.
13. Treat modules as the unit of capability, ownership, registration, discovery,
    lifecycle, and customization. Environment, server, and node definitions
    compose runtime processes and endpoint coordinates; they are not capability
    boundaries and must not replace module-centric behavior.

## Module And Runtime Composition Principle

Every active module contributes its own metadata and lifecycle identity. A
runtime instance is a process hosting an effective set of active modules. A
server definition selects that set and declares local or remote coordinates; it
does not own the capabilities provided by those modules.

Control-plane registration and discovery must therefore use module identity
plus runtime-instance identity. Non-API modules may register ownership and
capability metadata without a callable endpoint. Client discovery exposes only
modules whose effective metadata and policy make them client-callable.

## Default Tenant And Active Tenant

Default tenant is used during startup and system bootstrap when all tenants may not yet be initialized.

Active tenant is used to serve customer requests and should be resolved from request context, enterprise/token data, or runtime request metadata.

Do not confuse these two concepts. Startup logic may use default tenant; request processing should prefer active tenant.

Tenant also decides data placement and runtime isolation. A business that
accepts shared infrastructure can use the shared `default` tenant. A business
with privacy, residency, regulatory, or operational separation requirements can
use a dedicated tenant whose database, search index, cache namespace, storage
path, import/export location, audit records, diagnostics, and runtime
configuration point to private or approved infrastructure.

Do not hardcode tenant placement in feature code. Resolve tenant context through
Nodics and use layered configuration, tenant records, governed runtime
configuration, or provider modules to decide where data is stored, indexed,
cached, imported, exported, audited, and governed.

## Customization Rule

A customer project should be able to override schemas, services, facades, controllers, routers, pipelines, data, tests, and configuration in a later-loaded module without editing out-of-the-box Nodics files.

Example:

An organization building `AmazonEcom` should be able to extend `catalog.catalog` schema, override catalog service behavior, add routes, add validation, or change data import behavior in its own project modules. It should not edit the core Nodics catalog module.

## Change Acceptance Contract

This contract applies to every modification and every new source file. A change is not complete merely because its default implementation works.

Use `contracts/developer-implementation-contract.md` when deciding where a
feature belongs, which extension point should own it, and how human developers
or AI tools should guide implementation without bypassing Nodics module,
generated-layer, tenant, or runtime-governance contracts.

1. Follow established Nodics module, loader, registry, schema, service, facade, controller, router, pipeline, interceptor, validator, data, configuration, and runtime-governance patterns. Do not introduce a parallel mechanism when an existing extension mechanism owns the capability.
2. Resolve implementation choices from the effective active module hierarchy, configuration, tenant/request context, schema definitions, and governed runtime state. Do not embed customer, project, environment, server, node, tenant, group, role, or deployment assumptions in framework code.
3. Preserve the hierarchy from framework defaults through project, environment, server, and node contributions. A later-loaded customer project module must be able to extend, replace, or govern applicable schemas, services, facades, controllers, routers, pipelines, interceptors, validators, data, tests, configuration, and runtime policy without modifying out-of-the-box Nodics code.
4. Put defaults behind layered configuration or replaceable services. An implementation-specific default must not become an unchangeable platform capability contract.
5. Put configurable values, policy defaults, tooling command declarations, discovery rules, and governance gate data in module-owned `config/properties.js` under clear namespaces. Do not introduce parallel config files such as `config/tooling.js` or standalone governance JSON when a property subtree can own the data.
6. Keep runtime files discoverable by their owning loader. A service, controller, facade, or pipeline definition outside the loader path or missing the loader suffix is not a valid extension point; move it to the correct layer, rename it, or document it as a generator template/source helper that is not runtime-loaded.
7. Export services, controllers, facades, and pipeline-support behavior as mergeable object members. Do not hide overridable behavior in private closures, standalone exports, or non-standard folders when a later module must be able to replace one function.
8. Derive generated artifacts from effective layered source definitions. Build must recreate them and clean must remove them safely; generated output is never the source of truth.
9. Add test coverage with the implementation. Include positive, negative, security/access-control, tenant-context, and traceability coverage as applicable. During the current pre-production modernization phase, prefer clean best-principle implementation tests over compatibility-shim tests unless the owner explicitly asks for a compatibility path. Every new or changed extension point must include an override/customization test proving a later-loaded module can change the behavior without editing core. Cross-module behavior must cover consolidated and modular deployment where applicable.
10. Every new source file must include file-level documentation when it is created. Document purpose, owner, layer, extension path, inputs/outputs, side effects, failure behavior, and exported methods before the file is considered complete.
11. Update module and LLM documentation when ownership, configuration, dependencies, extension points, runtime behavior, or operational contracts change. Documentation must be beginner-readable and explicit enough for AI tools to place code in the correct module, folder, layer, file, export shape, configuration namespace, test, and generation path.

Code review must reject a change whose customization path is absent, undocumented, or untested. Capabilities are sacred; the default implementation remains negotiable through the hierarchy.

## Control Plane Direction

The admin application should become the Nodics control plane for:

- modules
- tenants
- environments
- servers
- nodes
- schemas
- routes
- workflows
- integrations
- secrets
- behavior overrides
- validation
- audit
- rollback
- access policies
- import/export runs

Backend APIs must support this control plane. UI is a client of the backend, not a replacement for backend governance.

The control plane presents server and node compositions only as deployment
views over modules. Modules remain authoritative for capabilities, schemas,
routes, permissions, lifecycle, and business behavior.
