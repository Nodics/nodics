# Nodics

Nodics is an enterprise application platform for building modular, API-driven applications.

It helps teams create applications from clear capabilities such as APIs, services, data models, configuration, scheduled jobs, events, imports, exports, permissions, tenants, tests, and deployment topology.

## Why Nodics

Enterprise applications often become difficult to change because business behavior, configuration, data access, security, and generated code are spread across unrelated files.

Nodics gives each capability a clear owner and a clear extension path.

The main rule is:

```text
Capabilities are stable. Implementations can change.
```

That means a project can customize behavior through project modules, environment configuration, server configuration, node configuration, tenant context, runtime configuration, data, or provider modules without changing released framework code for every customer need.

## What You Can Build

With Nodics you can build:

- REST APIs and generated API contracts.
- Business services and application modules.
- Tenant-aware applications.
- Runtime configuration with audit and rollback.
- Scheduled jobs.
- Data import and export flows.
- Event and messaging integrations.
- Cache-backed services.
- Database provider integrations.
- Generated tests, OpenAPI output, and governance reports.

## Start Here

Read the public documentation:

- [Nodics Documentation](gDocs/README.md)
- [What Nodics Is](gDocs/overview/what-is-nodics.md)
- [How To Set Up Nodics](gDocs/getting-started/how-to-setup-nodics.md)
- [How Nodics Is Organized](gDocs/architecture/how-nodics-is-organized.md)
- [How Configuration Works](gDocs/configuration/how-configuration-works.md)

## Common Commands

Install dependencies:

```bash
npm install
```

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

