# Nodics Documentation

Welcome to the Nodics documentation.

Nodics is an enterprise application factory for building modular, governed, API-driven business platforms. It is designed for teams that need MVP speed, AI-assisted development, customization, tenant-aware behavior, runtime control, and long-term maintainability in the same framework.

This documentation is written for several kinds of readers:

- Business owners and decision makers evaluating value, fit, risk, and time to market.
- People who are new to Nodics or enterprise application frameworks and need plain-language, step-by-step guidance.
- Application developers who need task-based implementation guidance.
- Experienced developers and architects who need exact extension points, configuration rules, and verification commands.
- Operators and security reviewers who need deployment, runtime, access, and evidence guidance.

Nodics gives you a framework, runtime structure, generated APIs, layered configuration, tenant-aware behavior, scheduled jobs, import/export, search indexing, catalog and content capabilities, messaging, caching, testing, and deployment patterns that can be extended by projects without changing framework source code.

It is also built for AI-assisted development. A developer can work through a command-line AI tool, an IDE assistant, or a conversational coding assistant and ask for business functionality in plain language. Nodics documentation and contracts then guide that work into the correct module, service, route, schema, configuration, test, and documentation path.

## How To Read This Documentation

You do not need to read every page in order. Choose the journey that matches
your goal.

### Business Owner Or Decision Maker

1. [Why Businesses Choose Nodics](business/why-businesses-choose-nodics.md)
2. [Why Businesses Can Trust Nodics](business/security-and-trust.md)
3. [Business Capabilities And Outcomes](business/business-capabilities-and-outcomes.md)
4. [How Nodics Compares With Other Approaches](business/how-nodics-compares.md)
5. [Business And Technical Evaluation Checklist](business/evaluation-checklist.md)

### Beginner Or First-Time Evaluator

1. [What Nodics Is](overview/what-is-nodics.md)
2. [How To Set Up Nodics](getting-started/how-to-setup-nodics.md)
3. [How Nodics Is Organized](architecture/how-nodics-is-organized.md)
4. [How Configuration Works](configuration/how-configuration-works.md)
5. [Build Your First Nodics Capability](getting-started/build-your-first-capability.md)

### Application Developer

1. [How To Create Application Functionality](development/how-to-create-application-functionality.md)
2. [How To Customize And Extend Nodics](development/how-to-customize-and-extend-nodics.md)
3. [Common Implementation Examples](development/common-implementation-examples.md)
4. [How To Create APIs](development/how-to-create-apis.md)
5. [How To Work With Data](data/how-to-work-with-data.md)
6. [How To Create Scheduled Jobs](jobs/how-to-create-scheduled-jobs.md)
7. [How To Test Nodics Changes](testing/how-to-test-nodics-changes.md)
8. [How To Approve And Publish Content](content/how-to-approve-and-publish-content.md)
9. [How Warehouse Management Works](commerce/how-to-manage-warehouses.md)
10. [How Store Management Works](commerce/how-to-manage-stores.md)
11. [How To Model Stores And Website Experiences](commerce/how-to-model-stores-and-websites.md)
12. [How Units And Land Measurements Work](data/how-to-use-units-and-land-measurements.md)
13. [How Stock Movements Work](commerce/how-stock-movements-work.md)
14. [How Stock Pools Work](commerce/how-to-manage-stock-pools.md)
15. [How Stock Sourcing Works](commerce/how-stock-sourcing-works.md)
16. [How Stock ON_HAND Availability Works](commerce/how-stock-availability-works.md)
17. [How to Reserve Stock](commerce/how-to-reserve-stock.md)
18. [How Stock Allocation Works](commerce/how-stock-allocation-works.md)
19. [How Stock Transfers Work](commerce/how-stock-transfers-work.md)
20. [How Inventory Reconciliation Works](commerce/how-inventory-reconciliation-works.md)
21. [How To Operate And Integrate Inventory](commerce/how-to-operate-and-integrate-inventory.md)
22. [How To Configure And Operate Pricing](commerce/how-to-configure-and-operate-pricing.md)
23. [How To Create And Identify Products](commerce/how-to-create-and-identify-products.md)

### Architect, Security Reviewer, Or Operator

1. [Why Businesses Can Trust Nodics](business/security-and-trust.md)
2. [Security Shared-Responsibility Model](security/shared-responsibility-model.md)
3. [Security Evidence Guide](security/security-evidence-guide.md)
4. [BackOffice Browser Security](security/backoffice-browser-security.md)
5. [How Platform Capabilities Work](platform/how-platform-capabilities-work.md)
6. [How Users, Tenants, And Permissions Work](security/how-users-tenants-and-permissions-work.md)
7. [How Cache Works](platform/how-cache-works.md)
8. [How To Run And Debug Nodics](operations/how-to-run-and-debug-nodics.md)
9. [How To Prepare For Deployment](operations/how-to-prepare-for-deployment.md)
10. [Production Operating Model](operations/production-operating-model.md)

### Reference And Documentation Contributors

- [Module Documentation Index](reference/module-documentation-index.md)
- [Complete Module Catalog](reference/module-catalog.md)
- [Nodics Glossary](reference/glossary.md)
- [Provider And Capability Maturity Matrix](reference/provider-capability-maturity-matrix.md)
- [Licensing And Header Contract](reference/licensing-and-header-contract.md)
- [Documentation Maintenance Guide](documentation/how-to-maintain-documentation.md)
- [How To Publish Documentation On GitHub](documentation/how-to-publish-documentation-on-github.md)

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
| Decide whether Nodics fits a business or product | [Why Businesses Choose Nodics](business/why-businesses-choose-nodics.md), [Why Businesses Can Trust Nodics](business/security-and-trust.md), [How Nodics Compares](business/how-nodics-compares.md), and [Evaluation Checklist](business/evaluation-checklist.md) |
| Install, build, and start the framework | [How To Set Up Nodics](getting-started/how-to-setup-nodics.md) |
| Follow one complete beginner journey | [Build Your First Nodics Capability](getting-started/build-your-first-capability.md) |
| Understand projects, modules, environments, servers, and nodes | [How Nodics Is Organized](architecture/how-nodics-is-organized.md) |
| Add new application behavior | [How To Create Application Functionality](development/how-to-create-application-functionality.md) |
| Customize or generalize framework behavior safely | [How To Customize And Extend Nodics](development/how-to-customize-and-extend-nodics.md) |
| Follow examples for APIs, schemas, providers, scheduled jobs, and runtime configuration | [Common Implementation Examples](development/common-implementation-examples.md) |
| Add or change APIs | [How To Create APIs](development/how-to-create-apis.md) |
| Work with schemas, import, export, and data providers | [How To Work With Data](data/how-to-work-with-data.md) |
| Use exact quantities, compound units, and regional land-area conversions | [How Units And Land Measurements Work](data/how-to-use-units-and-land-measurements.md) |
| Approve Staged content and publish it safely to Online | [How To Approve And Publish Content](content/how-to-approve-and-publish-content.md) |
| Understand or customize enterprise warehouses and warehouse locations | [How Warehouse Management Works](commerce/how-to-manage-warehouses.md) |
| Create stores and associate Inventory warehouses | [How Store Management Works](commerce/how-to-manage-stores.md) |
| Model different websites, brands, countries, or shared Sites against Stores | [How To Model Stores And Website Experiences](commerce/how-to-model-stores-and-websites.md) |
| Record exact, idempotent on-hand Stock changes | [How Stock Movements Work](commerce/how-stock-movements-work.md) |
| Group Warehouses for future sourcing without copying Stock | [How Stock Pools Work](commerce/how-to-manage-stock-pools.md) |
| Select ordered Stock Pools from declarative business context | [How Stock Sourcing Works](commerce/how-stock-sourcing-works.md) |
| Calculate exact read-only ON_HAND Stock with Warehouse evidence | [How Stock ON_HAND Availability Works](commerce/how-stock-availability-works.md) |
| Hold Stock for checkout and fulfillment | [How to Reserve Stock](commerce/how-to-reserve-stock.md) |
| Allocate Order demand across Warehouses | [How Stock Allocation Works](commerce/how-stock-allocation-works.md) |
| Transfer Stock safely between Warehouses | [How Stock Transfers Work](commerce/how-stock-transfers-work.md) |
| Detect and repair Inventory inconsistencies | [How Inventory Reconciliation Works](commerce/how-inventory-reconciliation-works.md) |
| Operate Inventory, reconstruct Stock, or connect WMS/POS | [How To Operate And Integrate Inventory](commerce/how-to-operate-and-integrate-inventory.md) |
| Configure scoped Price Lists, Price Groups, exact Prices, and Staged-to-Online releases | [How To Configure And Operate Pricing](commerce/how-to-configure-and-operate-pricing.md) |
| Create enterprise Product Items and alternate identifiers | [How To Create And Identify Products](commerce/how-to-create-and-identify-products.md) |
| Use Nodics as a governed data lake or data hub | [How To Use Nodics As Data As A Service](data/how-to-use-nodics-as-data-as-a-service.md) |
| Add scheduled jobs | [How To Create Scheduled Jobs](jobs/how-to-create-scheduled-jobs.md) |
| Understand processes, messaging, logging, and request handling | [How Platform Capabilities Work](platform/how-platform-capabilities-work.md) |
| Configure, troubleshoot, or customize cache | [How Cache Works](platform/how-cache-works.md) |
| Understand users, tenants, permissions, and runtime isolation | [How Users, Tenants, And Permissions Work](security/how-users-tenants-and-permissions-work.md) |
| Evaluate security value, responsibilities, limitations, and evidence | [Why Businesses Can Trust Nodics](business/security-and-trust.md), [Security Shared-Responsibility Model](security/shared-responsibility-model.md), and [Security Evidence Guide](security/security-evidence-guide.md) |
| Verify a change | [How To Test Nodics Changes](testing/how-to-test-nodics-changes.md) |
| Run, debug, deploy, or operate Nodics | [How To Run And Debug Nodics](operations/how-to-run-and-debug-nodics.md), [How To Prepare For Deployment](operations/how-to-prepare-for-deployment.md), and [Production Operating Model](operations/production-operating-model.md) |
| Maintain public and module documentation | [Documentation Maintenance Guide](documentation/how-to-maintain-documentation.md) |
| Find module-specific capability documentation | [Module Documentation Index](reference/module-documentation-index.md) |
| Browse every package-defined module | [Complete Module Catalog](reference/module-catalog.md) |
| Understand Nodics terminology | [Nodics Glossary](reference/glossary.md) |
| Check whether a provider or capability is production-ready, guarded, sample, scaffolded, or parked | [Provider And Capability Maturity Matrix](reference/provider-capability-maturity-matrix.md) |
| Understand which files require the Nodics source header and how the copyright year is enforced | [Licensing And Header Contract](reference/licensing-and-header-contract.md) |

For module-specific details, read the owning module `README.md`. For implementation contracts used by AI tools and developers, read root [AGENTS.md](../AGENTS.md) and [gSetup/llm](../gSetup/llm/README.md).
