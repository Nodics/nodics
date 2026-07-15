# What Nodics Is

Nodics is an enterprise application factory for building modular, governed, API-driven business platforms.

It is more than a web framework and more than a collection of utilities. Nodics gives an application a complete operating structure: modules, APIs, schemas, services, permissions, tenants, runtime configuration, scheduled jobs, events, imports, exports, search indexing, catalog and content capabilities, tests, generated artifacts, deployment topology, and documentation.

Instead of putting all code in one application folder, Nodics organizes behavior into active capabilities. A capability can provide data models, APIs, services, scheduled jobs, events, import/export behavior, permissions, tests, and documentation. A project can then extend or replace behavior through later-loaded project modules without editing framework files.

Nodics is also built for AI-assisted development. Developers can use CLI-based AI tools, IDE assistants, or conversational coding tools to describe what they want to build. Nodics gives those tools a governed structure to follow so generated or assisted code lands in the right place and respects the same rules as human-written code.

## What Problem Nodics Solves

Many enterprise applications start simple and then become hard to maintain:

- API behavior is spread across many files with no clear owner.
- Configuration is copied into environments and becomes inconsistent.
- Data access rules are duplicated.
- Security decisions are hidden inside controllers.
- Generated files are edited manually.
- Customer-specific changes are made directly inside framework code.
- Testing is added after the behavior already exists.

Nodics solves this by giving every capability a clear place to live, a clear way to be extended, and a clear way to be verified.

That is the main reason Nodics is valuable for AI-assisted MVP development. A team can move quickly with command-line AI tools, IDE assistants, or conversational coding tools, but the generated work still lands inside a governed platform model instead of becoming scattered prototype code that is painful to scale later.

The core rule is:

```text
Capabilities are stable. Implementations can change.
```

For example, Nodics can provide a default database capability. A project can add a new database provider or change data access behavior through the module hierarchy, but it does not edit the original framework source just to serve one customer.

This makes Nodics especially strong for customer-specific enterprise work. The framework provides stable capabilities, while projects negotiate the implementation through approved extension layers.

## Who Uses Nodics

Nodics documentation is written for:

- Application developers building customer projects on top of Nodics.
- Framework developers extending Nodics itself.
- Test engineers validating generated APIs, permissions, imports, jobs, and runtime behavior.
- Technical leads defining project structure, environments, servers, and modules.
- AI coding tools that must follow the same implementation rules as human developers.

## Why Nodics Works Well With AI Tools

AI tools are powerful, but without structure they can create code in the wrong place, duplicate existing behavior, bypass security, or invent a second configuration path.

Nodics reduces that risk by making the application architecture explicit.

An AI tool can be asked to:

- Create a new API.
- Add a scheduled job.
- Add a configuration value.
- Create a new data model.
- Add a database provider.
- Add tests for a feature.
- Update documentation.

Nodics then provides the rules for where that work belongs:

- The owning module.
- The correct source folder.
- The configuration layer.
- The service, controller, route, schema, pipeline, or interceptor contract.
- The generated artifact boundary.
- The tests that must pass.
- The documentation that must be updated.

This lets developers interact with AI tools conversationally while still keeping the platform disciplined.

## Main Ideas

Nodics is based on a few simple ideas.

**Modules own capabilities.** A module owns the behavior, configuration, schemas, tests, and documentation for the feature it provides.

**Projects extend through layers.** A customer project adds or overrides behavior through project modules, environment modules, server modules, node modules, tenant configuration, runtime configuration, or data. It does not modify released framework code unless the work is explicitly framework maintenance.

**Configuration is layered.** Defaults come from the framework. Projects, environments, servers, nodes, tenants, and runtime configuration can refine behavior later in the hierarchy.

**Generated files come from source definitions.** Regenerate generated APIs, schemas, tests, OpenAPI output, and LLM context from the owning source. Do not hand-maintain generated output as the source of truth.

**Security is part of the contract.** Authentication, authorization, access control, validation, audit, rollback, diagnostics, and tests are not optional extras.

## What You Can Build

With Nodics, you can build:

- REST APIs backed by schema definitions.
- Business services and reusable facades.
- Scheduled jobs.
- Import and export flows.
- Search indexing and retrieval flows.
- Catalog, CMS, and content-template driven experiences.
- Tenant-aware applications.
- Event-driven workflows.
- Cache-backed services.
- Runtime configuration tools.
- Generated tests and API contracts.
- Modular customer applications that extend framework behavior safely.

## What Makes Nodics Different

Nodics is designed around enterprise extension, not one-off application code.

It combines:

- Modular capability ownership.
- Layered project customization.
- Tenant-aware runtime behavior.
- Source-defined generated artifacts.
- Security and permission contracts.
- Runtime configuration governance.
- Test and documentation gates.
- AI-readable implementation guidance.

That combination allows teams to move fast without giving up control.

## What To Read Next

If you are new, continue with [How To Set Up Nodics](../getting-started/how-to-setup-nodics.md).

If you already have Nodics running, read [How Nodics Is Organized](../architecture/how-nodics-is-organized.md).
