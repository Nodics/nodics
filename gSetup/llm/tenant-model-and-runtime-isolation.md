# Tenant Model And Runtime Isolation

Tenant is a runtime isolation and behavior boundary in Nodics. A single Nodics
runtime may serve multiple active tenants, but tenant-sensitive work must resolve
tenant context explicitly and use tenant-scoped configuration, persistence,
cache, search, jobs, events, authentication, audit, diagnostics, and governance.

Tenant isolation is a platform contract. It is not optional plumbing and must
not be bypassed by convenience defaults.

## Tenant And Enterprise

A tenant represents an isolated customer/runtime space. A tenant may have its
own data stores, indexes, cache namespaces, runtime configuration, jobs,
governance records, diagnostics, and behavior.

An enterprise is a business identity that maps to a tenant at runtime. Profile
services own enterprise and tenant records. Runtime code may use enterprise
context to resolve the tenant, but data access and tenant-sensitive behavior
must operate against the resolved tenant.

## Active Tenants

Nodics keeps active tenant state in the runtime registry:

- `NODICS.addActiveTenant(tntCode)`
- `NODICS.getActiveTenants()`
- `NODICS.removeActiveTenant(tntCode)`

It also maps enterprises to tenants:

- `NODICS.addActiveEnterprise(entCode, tenant)`
- `NODICS.getTenantForEnterprise(entCode)`
- `NODICS.getActiveEnterprises()`

Multiple tenants may be active in one process. Shared runtime code must not use
global mutable state in a way that lets one tenant affect another tenant.

## Default Tenant

`defaultTenant` is a bootstrap fallback. It is useful while startup is preparing
the platform and tenant records may not yet be loaded.

Request handling, customer behavior, imports, jobs, events, cache, search,
database access, and runtime governance should use the resolved request,
enterprise, active-tenant, or governance tenant context. Do not silently fall
back to `defaultTenant` when a tenant should have been resolved.

## Tenant-Aware Configuration

Framework defaults come from active module `config/properties.js` files and
external properties. Tenant-specific values may be loaded from active enterprise
tenant records or governed runtime configuration.

Configuration changes must document:

- whether the value is tenant-neutral or tenant-specific;
- the owning module and property path;
- the fallback behavior when tenant-specific configuration is absent;
- whether the value can be changed through runtime governance;
- which tests prove tenant isolation.

## Tenant-Aware Runtime Paths

Tenant context must be preserved through:

- database and model resolution;
- schema-generated DAO/service/facade/controller behavior;
- search indexes and indexers;
- item cache, router/API cache, and search cache;
- import/export headers, requested tenants, and target tenants;
- cron jobs, schedulers, workers, and node ownership;
- NEMS/EMS events, publishers, consumers, and retry handling;
- authentication, API keys, internal tokens, service accounts, and security stamps;
- runtime configuration preview, approval, activation, audit, and rollback;
- diagnostics, correlation ids, logs, reports, and test output.

If a module touches one of these paths, its implementation and tests must show
how tenant context is resolved and preserved.

## Developer Checklist

Before implementing a tenant-sensitive change:

1. Decide whether the behavior is tenant-neutral or tenant-specific.
2. Identify where tenant context comes from: request, enterprise, token, active
   tenant registry, runtime governance, import header, job definition, or
   bootstrap default.
3. Use the owning Nodics service, facade, pipeline, handler, generated model, or
   governed runtime path instead of direct cross-tenant shortcuts.
4. Preserve tenant context in logs, audit, diagnostics, cache keys, search
   indexes, import/export runs, events, jobs, and errors.
5. Add tests proving that one tenant cannot read, mutate, cache, index, export,
   govern, or authenticate as another tenant unless an explicit cross-tenant
   permission contract allows it.

## AI Tool Checklist

Before advising or changing code, AI tools must identify:

- affected tenant boundary;
- tenant source and fallback behavior;
- owning module and extension point;
- affected persistence, cache, search, event, cron, auth, import/export, and
  governance paths;
- tenant isolation tests and release gates.

AI tools must not assume `defaultTenant` is correct for request/runtime behavior.
They should suggest the Nodics-owned tenant resolution path before writing code.

## Business View

Tenant isolation lets one Nodics deployment support multiple customers or
business units while preserving separate data, behavior, operations, audit, and
rollback. It enables SaaS operation, customer-specific configuration,
tenant-scoped onboarding/deactivation, and governed runtime change without
modifying framework code.
