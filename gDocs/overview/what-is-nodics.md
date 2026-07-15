# What Nodics Is

Nodics is a framework for building enterprise applications as a collection of well-defined capabilities.

Instead of putting all code in one application folder, Nodics organizes behavior into active modules. A module can provide data models, APIs, services, scheduled jobs, events, import/export behavior, permissions, tests, and documentation. A project can then extend or replace behavior through later-loaded project modules without editing framework files.

## What Problem Nodics Solves

Many enterprise applications start simple and then become hard to maintain:

- API behavior is spread across many files with no clear owner.
- Configuration is copied into environments and becomes inconsistent.
- Data access rules are duplicated.
- Security decisions are hidden inside controllers.
- Generated files are edited manually.
- Customer-specific changes are made directly inside framework code.
- Testing is added after the behavior already exists.

Nodics solves this by giving every capability a clear place to live and a clear way to be extended.

The core rule is:

```text
Capabilities are stable. Implementations can change.
```

For example, Nodics can provide a default database capability. A project can add a new database provider or change data access behavior through the module hierarchy, but it should not edit the original framework source just to serve one customer.

## Who Uses Nodics

Nodics documentation is written for:

- Application developers building customer projects on top of Nodics.
- Framework developers extending Nodics itself.
- Test engineers validating generated APIs, permissions, imports, jobs, and runtime behavior.
- Technical leads defining project structure, environments, servers, and modules.
- AI coding tools that must follow the same implementation rules as human developers.

## Main Ideas

Nodics is based on a few simple ideas.

**Modules own capabilities.** A module should own the behavior, configuration, schemas, tests, and documentation for the feature it provides.

**Projects extend through layers.** A customer project should add or override behavior through project modules, environment modules, server modules, node modules, tenant configuration, runtime configuration, or data. It should not modify released framework code unless the work is explicitly framework maintenance.

**Configuration is layered.** Defaults come from the framework. Projects, environments, servers, nodes, tenants, and runtime configuration can refine behavior later in the hierarchy.

**Generated files come from source definitions.** Generated APIs, schemas, tests, OpenAPI output, and LLM context should be regenerated from the owning source. Do not hand-maintain generated output as the source of truth.

**Security is part of the contract.** Authentication, authorization, access control, validation, audit, rollback, diagnostics, and tests are not optional extras.

## What You Can Build

With Nodics, you can build:

- REST APIs backed by schema definitions.
- Business services and reusable facades.
- Scheduled jobs.
- Import and export flows.
- Tenant-aware applications.
- Event-driven workflows.
- Cache-backed services.
- Runtime configuration tools.
- Generated tests and API contracts.
- Modular customer applications that extend framework behavior safely.

## What To Read Next

If you are new, continue with [How To Set Up Nodics](../getting-started/how-to-setup-nodics.md).

If you already have Nodics running, read [How Nodics Is Organized](../architecture/how-nodics-is-organized.md).

