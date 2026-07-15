# How To Prepare For Deployment

Deployment means preparing Nodics to run safely in a target environment.

Deployment is not only copying files to a server. It includes configuration, generated artifacts, tests, data, security, and operational checks.

## Before Deployment

Confirm:

- Target environment.
- Active modules.
- Server and node topology.
- Database connection values.
- Cache provider.
- Messaging provider.
- Security secrets.
- Tenant configuration.
- Runtime configuration policy.
- Import and initial data requirements.
- Release tests.

## Build Before Release

Run:

```bash
npm run build
```

The build command validates governance, documentation, generated artifacts, OpenAPI output, LLM context, and generated documentation coverage.

## Run Tests

At minimum:

```bash
npm run test:basic
```

For release:

```bash
npm run test:full
```

Run live release tests only against isolated approved infrastructure.

## Verify Topology

Consolidated mode means one server runs many capabilities together.

Modular mode means capabilities run in separate server processes.

Nodics supports both styles because different deployments need different runtime boundaries. Local development may prefer one process. Enterprise deployments may split identity, CMS, workflow, events, scheduled jobs, import/export, and data processing into separate processes.

Before deployment, confirm:

- which server owns each active module;
- which modules run locally in each process;
- which modules are reached through remote server coordinates;
- which nodes are allowed to run scheduled jobs;
- which providers are active for database, cache, search, and messaging;
- where generated reports and diagnostics are written.

Verify modular topology:

```bash
npm run test:topology:modular
```

## Verify Data

Check:

- Initial data is idempotent.
- Sample data is not required in production.
- Tenant data is correctly isolated.
- Imports target the correct tenant.
- Runtime configuration can be audited and rolled back.

Also confirm that versioned or publishable business data has a rollback path when the business process requires it. Published content, catalog data, workflow definitions, runtime configuration, and import runs do not depend on manual database repair as the normal recovery strategy.

## Verify Security

Check:

- Login routes are intentionally pre-authentication.
- Internal module routes remain secured.
- Permissions are assigned to the right groups.
- Service accounts have least privilege.
- Secrets are not stored in source-controlled files.
- Audit logs do not expose credentials.

## Verify Documentation

Documentation should match the deployed behavior.

Run:

```bash
npm run docs:coverage:source -- --limit=20
npm run docs:coverage:contracts -- --limit=20
```

## What To Avoid

Avoid:

- Deploying unbuilt generated artifacts.
- Changing generated files directly on the server.
- Using local sample data in production.
- Sharing test infrastructure with production.
- Disabling security to make deployment easier.
- Making environment-specific changes in framework source.
- Deploying with unclear active module ownership.
- Mixing sample data with production initialization data.
