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
