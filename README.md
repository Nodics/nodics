# Nodics

Nodics is an enterprise application factory for building serious, modular, API-driven business platforms.

It is designed for the biggest gap many startups and product teams face today: building an MVP is faster than ever, but scaling that MVP into a secure, governed, multi-team, multi-tenant product is still painfully hard.

AI-assisted coding and rapid prototyping can create impressive demos quickly. That speed is valuable. The problem starts when the MVP becomes the real product and the team discovers that the codebase has no strong module boundaries, no layered architecture, no governance model, no safe customization path, weak security rules, limited test coverage, and no reliable way to evolve customer-specific behavior.

Nodics bridges that gap. It lets teams move with the speed of AI-assisted product development while keeping the architecture, governance, security, testing, and extension model expected from an enterprise platform.

It helps teams build fast like an MVP, but with the architecture discipline of an enterprise platform from day one. The framework provides a ready project model with APIs, data models, services, permissions, tenants, scheduled jobs, events, imports, exports, search indexing, catalog and content capabilities, runtime configuration, testing, deployment topology, documentation, and extension contracts already built into the way the application is organized.

Each capability has a clear owner, a clear extension path, and a clear verification contract.

Nodics is designed for the new way software is built: human developers and AI tools working together. A developer can use a CLI-based AI assistant, an IDE assistant, or a conversational coding tool to ask for new functionality in natural language, while Nodics guides that implementation into the right module, configuration layer, service, route, schema, test, and documentation area.

In short:

```text
Describe the business capability. Nodics gives it a governed place to live.
```

## Why Nodics

Many products fail after the MVP stage because the early application was built only to prove the idea, not to become the long-term platform.

Common scaling problems include:

- Features are added wherever the first developer or AI tool finds space.
- Business logic has no clear owner.
- APIs, services, data access, and permissions are tightly coupled.
- Configuration is copied across environments.
- Customer-specific behavior is added directly into core code.
- Security and tenant isolation are added late.
- Generated code becomes manually edited code.
- Tests do not cover real extension and deployment behavior.
- The team cannot safely split the application into multiple services or nodes.

Nodics turns that complexity into a controlled application structure. It helps teams build quickly without losing architectural discipline.

The main rule is:

```text
Capabilities are stable. Implementations can change.
```

That means a project can customize behavior through project modules, environment configuration, server configuration, node configuration, tenant context, runtime configuration, data, or provider modules without changing released framework code for every customer need.

This is especially powerful with AI-assisted development. Instead of asking an AI tool to invent a structure, the developer can ask for a capability and Nodics provides the rules that keep the implementation aligned with the platform.

## The MVP-To-Scale Bridge

Nodics lets teams start fast without accepting a throwaway architecture.

You can use AI tools and rapid development workflows to create features quickly, but those features still land inside a scalable application model:

- Modular capabilities instead of scattered code.
- Layered customization instead of framework edits.
- Tenant-aware behavior instead of hard-coded customer assumptions.
- Runtime configuration with audit and rollback instead of risky production edits.
- Built-in security, permission, validation, and diagnostics patterns.
- Generated APIs and tests from source definitions.
- Environment, server, and node topology for growth beyond one process.
- Documentation and AI guidance that keep humans and tools aligned.

The result is a faster MVP path with a cleaner route to production scale.

## What Makes Nodics Strong

Nodics is not only a runtime. It is a complete application model that knows how enterprise software should be organized, extended, tested, operated, and explained.

The current framework and sample project structure includes more than one hundred package-defined modules and submodules across framework capabilities, core business capabilities, content, commerce, data processing, optional features, environments, servers, and nodes. Those modules are not just folders. They define where behavior belongs and how it can be replaced safely by a project without modifying released framework code.

Nodics provides:

- **Automated layered architecture:** projects, modules, environments, servers, nodes, tenants, and runtime configuration each have a defined role.
- **Generated application artifacts:** schemas, routes, tests, OpenAPI contracts, governance reports, and AI context are generated from source definitions.
- **Inbuilt search indexing and retrieval:** search modules define indexes, indexers, indexer logs, search routes, and provider extension points.
- **Catalog and content capabilities:** catalog, CMS, and web CMS modules provide product/content modeling, page/component structures, renderer mappings, and content templating foundations.
- **Import and export engines:** JavaScript, JSON, CSV, and Excel provider modules demonstrate the pattern for moving data in and out through governed import/export flows.
- **Enterprise identity foundations:** enterprises, tenants, users, customers, employees, groups, permissions, API keys, and authentication behavior are modeled as platform capabilities.
- **Runtime governance:** schema, router, class, pipeline, tenant property, access-policy, activation, preview, audit, cleanup, and rollback capabilities are part of the runtime control plane.
- **Messaging, events, jobs, and workflows:** event handling, message clients, cron jobs, workflow carriers, actions, lifecycle operations, retries, pause/resume, and archive behavior are represented as first-class capabilities.
- **Cache and provider extensibility:** cache, database, search, messaging, and data providers are modeled as replaceable modules.
- **Testing as architecture evidence:** generated schema, CRUD, API contract, and API scenario tests make framework behavior verifiable instead of implied.
- **AI-ready learning context:** generated LLM context and implementation contracts teach AI tools the same module, service, configuration, and extension rules expected from human developers.

For example, the current generated governance report for the sample local server records 64 schemas, 154 routes, 651 governed artifacts, and 364 generated files. The checked Postman collection contains 188 API examples across 34 functional folders. Those numbers matter because they show Nodics is already structured as a platform surface, not a single demo application.

## What You Can Build

With Nodics you can build:

- REST APIs and generated API contracts.
- Business services and application modules.
- Tenant-aware applications.
- Runtime configuration with audit and rollback.
- Scheduled jobs.
- Data import and export flows.
- Search indexing and retrieval flows.
- Catalog, CMS, and content-template driven experiences.
- Event and messaging integrations.
- Cache-backed services.
- Database provider integrations.
- Workflow-driven business processes.
- Generated tests, OpenAPI output, LLM context, and governance reports.

You can also use AI tools more safely because Nodics gives them explicit contracts: where to code, how to extend, what to test, what to document, and what must never become a hidden source of truth.

## Start Here

Read the public documentation:

- [Nodics Documentation](gDocs/README.md)
- [What Nodics Is](gDocs/overview/what-is-nodics.md)
- [How To Set Up Nodics](gDocs/getting-started/how-to-setup-nodics.md)
- [How Nodics Is Organized](gDocs/architecture/how-nodics-is-organized.md)
- [How Configuration Works](gDocs/configuration/how-configuration-works.md)

## Common Commands

Use the repository runtime contract before installing dependencies. The
preferred release line is Node.js 24 with npm 11. Node.js 22 remains in the
supported validation matrix, and Node.js 26 is for forward validation as it
moves toward LTS. Do not use Node.js 25 as a release target.

Install dependencies:

```bash
npm ci
```

Use `npm install` only when intentionally changing dependencies, and commit
`package.json` and `package-lock.json` together.

Build generated artifacts and documentation outputs:

```bash
npm run build
```

Start Nodics:

```bash
npm run start
```

Start with debugger support:

```bash
npm run start:debug
```

Run the main test gate:

```bash
npm run test:basic
```

Run the full test gate:

```bash
npm run test:full
```

Print the clean-checkout release gate:

```bash
npm run release:check
```

Execute it when preparing a release candidate:

```bash
npm run release:check -- --execute --full
```

## Documentation Map

- Public user and developer guides: [gDocs](gDocs/README.md)
- Module-specific guides: each module `README.md`
- AI and implementation rules: `AGENTS.md` and `gSetup/llm`
- Generated API documentation: generated during build
- Generated AI context: generated with `npm run llm:generate`

## For Developers

When adding or changing functionality:

1. Find the capability that owns the behavior.
2. Make the change in the owning module or project layer.
3. Keep generated files generated from source definitions.
4. Add or update tests.
5. Update public and module documentation when behavior changes.

Use [How To Create Application Functionality](gDocs/development/how-to-create-application-functionality.md) for the recommended development flow.
