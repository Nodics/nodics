# How Nodics Is Organized

Nodics is organized around capabilities.

A capability is something the application can do, such as manage users, expose APIs, connect to a database, run scheduled jobs, process imports, publish events, or apply runtime configuration.

Each capability should have a clear owner.

## The Big Picture

A Nodics application usually contains:

- Framework capabilities supplied by Nodics.
- Core business capabilities supplied by Nodics or a project.
- Customer project capabilities.
- Environment definitions.
- Server definitions.
- Node definitions.
- Runtime and tenant configuration.

This structure lets a project customize behavior without modifying framework files.

## Application Project

An application project represents the product or customer application built on top of Nodics.

It usually contains:

- Project metadata.
- Project modules.
- Environment definitions.
- Server definitions.
- Node definitions.
- Project documentation.

Use the project area for customer-specific behavior, application-specific modules, and environment setup.

## Module Groups

A module group is a folder that groups related modules.

For example, one group may contain content modules, another may contain commerce modules, and another may contain data-processing modules.

Use a group when capabilities belong together but still need separate ownership.

## Capability Modules

A capability module owns one feature area.

A module can include:

- Configuration.
- Schemas.
- Routes.
- Services.
- Controllers.
- Facades.
- Pipelines.
- Interceptors.
- Events.
- Utility definitions.
- Initial data.
- Sample data.
- Tests.
- Documentation.

When adding behavior, first ask:

```text
Which capability owns this?
```

If the answer is unclear, do not create a random folder. Decide the owner first.

## Environments

An environment represents where the application runs, such as local, development, UAT, pre-production, or production.

Environment configuration should describe environment-level behavior. It should not become a place for unrelated business logic.

## Servers

A server defines a runnable application process or group of active modules.

For example, one server may run all capabilities together for local development. Another setup may split profile, workflow, events, and scheduled jobs into separate servers.

Use servers to define runtime boundaries.

## Nodes

A node is a more specific runtime unit below a server.

Node configuration is useful when multiple processes of the same server type need different responsibilities, ports, ownership rules, or scheduled-job behavior.

## Layered Customization

Nodics loads behavior in a defined order. Later layers can override earlier behavior when the contract allows it.

This is the most important customization rule:

```text
Do not change framework code for a customer-specific need when a later project layer can provide the behavior.
```

Examples:

- Add a project service with the same service function to override behavior.
- Add project configuration to override default configuration.
- Add project schemas or route configuration through the supported hierarchy.
- Add project data rather than changing framework seed data.
- Add provider modules for new adapters such as a database, cache engine, or search engine.

## Where Documentation Belongs

Use this public documentation for user guides and task-based explanations.

Use module README files for module-specific behavior.

Use AI/developer contracts only for implementation rules. Do not make public users read AI governance material just to understand how to build a feature.

