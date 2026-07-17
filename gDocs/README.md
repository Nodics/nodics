# Nodics Documentation

Welcome to the Nodics documentation.

Nodics is an enterprise application factory for building modular, governed, API-driven business platforms. It is designed for teams that need MVP speed, AI-assisted development, customization, tenant-aware behavior, runtime control, and long-term maintainability in the same framework.

This documentation is written for two kinds of readers:

- People who are new to Nodics and need step-by-step guidance.
- Experienced developers who need exact extension points, configuration rules, and verification commands.

Nodics gives you a framework, runtime structure, generated APIs, layered configuration, tenant-aware behavior, scheduled jobs, import/export, search indexing, catalog and content capabilities, messaging, caching, testing, and deployment patterns that can be extended by projects without changing framework source code.

It is also built for AI-assisted development. A developer can work through a command-line AI tool, an IDE assistant, or a conversational coding assistant and ask for business functionality in plain language. Nodics documentation and contracts then guide that work into the correct module, service, route, schema, configuration, test, and documentation path.

## How To Read This Documentation

Start with the first two sections if you are new. Use the task guides when you already know what you want to build.

1. [What Nodics Is](overview/what-is-nodics.md)
2. [How To Set Up Nodics](getting-started/how-to-setup-nodics.md)
3. [How Nodics Is Organized](architecture/how-nodics-is-organized.md)
4. [How Configuration Works](configuration/how-configuration-works.md)
5. [How To Create Application Functionality](development/how-to-create-application-functionality.md)
6. [How To Customize And Extend Nodics](development/how-to-customize-and-extend-nodics.md)
7. [Common Implementation Examples](development/common-implementation-examples.md)
8. [How To Create APIs](development/how-to-create-apis.md)
9. [How To Work With Data](data/how-to-work-with-data.md)
10. [How To Use Nodics As Data As A Service](data/how-to-use-nodics-as-data-as-a-service.md)
11. [How To Create Scheduled Jobs](jobs/how-to-create-scheduled-jobs.md)
12. [How Platform Capabilities Work](platform/how-platform-capabilities-work.md)
13. [How Cache Works](platform/how-cache-works.md)
14. [How Users, Tenants, And Permissions Work](security/how-users-tenants-and-permissions-work.md)
15. [How To Test Nodics Changes](testing/how-to-test-nodics-changes.md)
16. [How To Run And Debug Nodics](operations/how-to-run-and-debug-nodics.md)
17. [How To Prepare For Deployment](operations/how-to-prepare-for-deployment.md)
18. [How To Publish Documentation On GitHub](documentation/how-to-publish-documentation-on-github.md)
19. [Documentation Maintenance Guide](documentation/how-to-maintain-documentation.md)
20. [Module Documentation Index](reference/module-documentation-index.md)
21. [Provider And Capability Maturity Matrix](reference/provider-capability-maturity-matrix.md)

## Documentation Principles

Nodics documentation must be useful before it is clever.

Every guide should answer:

- What problem does this feature solve?
- When should I use it?
- Where should I make the change?
- What files or configuration are involved?
- What should I avoid?
- How do I verify that it works?
- How can a project customize this without changing Nodics framework code?

Avoid internal folder names in page titles unless the folder name is the thing the user must open. Prefer task names such as "How to create a scheduled job" instead of implementation names such as "cronjob module".

## Relationship With Module Documentation

This folder explains Nodics from the user and application-developer point of view.

Module `README.md` files explain the details of one specific capability. For example, this documentation may say how scheduled jobs work in Nodics, while the scheduled-job module README explains the exact schemas, services, routes, and extension contracts owned by that module.

Use the [Module Documentation Index](reference/module-documentation-index.md)
to move from task-based guides to the module that owns the exact capability
details.

AI-only and implementation-governance rules belong in `AGENTS.md` and `gSetup/llm`, not in public user documentation.

## Where To Find The Right Guidance

Use this map when you are not sure where to start.

| Need | Read |
| --- | --- |
| Understand what Nodics is and why it exists | [What Nodics Is](overview/what-is-nodics.md) |
| Install, build, and start the framework | [How To Set Up Nodics](getting-started/how-to-setup-nodics.md) |
| Understand projects, modules, environments, servers, and nodes | [How Nodics Is Organized](architecture/how-nodics-is-organized.md) |
| Add new application behavior | [How To Create Application Functionality](development/how-to-create-application-functionality.md) |
| Customize or generalize framework behavior safely | [How To Customize And Extend Nodics](development/how-to-customize-and-extend-nodics.md) |
| Follow examples for APIs, schemas, providers, scheduled jobs, and runtime configuration | [Common Implementation Examples](development/common-implementation-examples.md) |
| Add or change APIs | [How To Create APIs](development/how-to-create-apis.md) |
| Work with schemas, import, export, and data providers | [How To Work With Data](data/how-to-work-with-data.md) |
| Use Nodics as a governed data lake or data hub | [How To Use Nodics As Data As A Service](data/how-to-use-nodics-as-data-as-a-service.md) |
| Add scheduled jobs | [How To Create Scheduled Jobs](jobs/how-to-create-scheduled-jobs.md) |
| Understand processes, messaging, logging, and request handling | [How Platform Capabilities Work](platform/how-platform-capabilities-work.md) |
| Configure, troubleshoot, or customize cache | [How Cache Works](platform/how-cache-works.md) |
| Understand users, tenants, permissions, and runtime isolation | [How Users, Tenants, And Permissions Work](security/how-users-tenants-and-permissions-work.md) |
| Verify a change | [How To Test Nodics Changes](testing/how-to-test-nodics-changes.md) |
| Run, debug, or deploy Nodics | [How To Run And Debug Nodics](operations/how-to-run-and-debug-nodics.md) and [How To Prepare For Deployment](operations/how-to-prepare-for-deployment.md) |
| Maintain public and module documentation | [Documentation Maintenance Guide](documentation/how-to-maintain-documentation.md) |
| Find module-specific capability documentation | [Module Documentation Index](reference/module-documentation-index.md) |
| Check whether a provider or capability is production-ready, guarded, sample, scaffolded, or parked | [Provider And Capability Maturity Matrix](reference/provider-capability-maturity-matrix.md) |

For module-specific details, read the owning module `README.md`. For implementation contracts used by AI tools and developers, read root `AGENTS.md` and `gSetup/llm`.
