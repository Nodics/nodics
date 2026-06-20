# Nodics Principles

## Product Intention

Nodics is an enterprise-grade Node.js application platform inspired by SAP Hybris/SAP Commerce, ATG/Oracle Web Commerce, and Demandware. It is designed for organizations that need to build large, customizable business systems while keeping the core framework upgradeable.

The platform should support product, commerce, content, workflow, eventing, data import/export, runtime configuration, generated APIs, modular deployment, and admin/control-plane governance.

## Non-Negotiable Rule

Capabilities are sacred; implementations are negotiable.

Modernization may replace old libraries, improve security, refactor legacy code, add validation, add tests, and improve diagnostics. It must not remove enterprise platform capabilities because they are complex.

## Architecture Rules

1. Treat Nodics as a configurable enterprise application platform and application factory.
2. Preserve layered module hierarchy and override behavior.
3. Keep framework behavior generic; never hardcode customer/project modules into framework logic.
4. Put source definitions in modules; regenerate derived artifacts during build.
5. Keep generated artifacts safely removable by clean.
6. Use service/facade/controller/router boundaries consistently.
7. Use schema-driven models, services, routers, APIs, tests, and documentation where possible.
8. Preserve multi-tenancy and the difference between default tenant and active tenant.
9. Preserve runtime configuration, audit, rollback, validation, and access-control governance.
10. Add tests for both consolidated and modular deployment behavior when behavior crosses module/process boundaries.

## Default Tenant And Active Tenant

Default tenant is used during startup and system bootstrap when all tenants may not yet be initialized.

Active tenant is used to serve customer requests and should be resolved from request context, enterprise/token data, or runtime request metadata.

Do not confuse these two concepts. Startup logic may use default tenant; request processing should prefer active tenant.

## Customization Rule

A customer project should be able to override schemas, services, facades, controllers, routers, pipelines, data, tests, and configuration in a later-loaded module without editing out-of-the-box Nodics files.

Example:

An organization building `AmazonEcom` should be able to extend `catalog.catalog` schema, override catalog service behavior, add routes, add validation, or change data import behavior in its own project modules. It should not edit the core Nodics catalog module.

## Change Acceptance Contract

This contract applies to every modification and every new source file. A change is not complete merely because its default implementation works.

1. Follow established Nodics module, loader, registry, schema, service, facade, controller, router, pipeline, interceptor, validator, data, configuration, and runtime-governance patterns. Do not introduce a parallel mechanism when an existing extension mechanism owns the capability.
2. Resolve implementation choices from the effective active module hierarchy, configuration, tenant/request context, schema definitions, and governed runtime state. Do not embed customer, project, environment, server, node, tenant, group, role, or deployment assumptions in framework code.
3. Preserve the hierarchy from framework defaults through project, environment, server, and node contributions. A later-loaded customer project module must be able to extend, replace, or govern applicable schemas, services, facades, controllers, routers, pipelines, interceptors, validators, data, tests, configuration, and runtime policy without modifying out-of-the-box Nodics code.
4. Put defaults behind layered configuration or replaceable services. An implementation-specific default must not become an unchangeable platform capability contract.
5. Derive generated artifacts from effective layered source definitions. Build must recreate them and clean must remove them safely; generated output is never the source of truth.
6. Add test coverage with the implementation. Include positive, negative, security/access-control, tenant-context, traceability, and backward-compatibility coverage as applicable. Every new or changed extension point must include an override/customization test proving a later-loaded module can change the behavior without editing core. Cross-module behavior must cover consolidated and modular deployment where applicable.
7. Update module and LLM documentation when ownership, configuration, dependencies, extension points, runtime behavior, or operational contracts change.

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
