# How To Set Up Nodics

This guide explains how to prepare a local Nodics workspace, install dependencies, build generated artifacts, and start the application.

The goal is not only to run Nodics once. The goal is to understand what each command does so you can diagnose problems later.

## Before You Start

You need:

- Node.js and npm.
- MongoDB for the default local database flow.
- Redis if you want to run live Redis cache or distributed auth checks.
- A terminal.
- A code editor such as Visual Studio Code.

If you are working inside a company project, confirm which branch and environment you should use before running startup commands.

## Install Dependencies

From the repository root:

```bash
npm install
```

This installs the Node packages used by the framework, project modules, tests, and tooling.

If dependency installation fails, check:

- Your Node.js version.
- Your npm registry access.
- Whether the lock file changed unexpectedly.
- Whether native dependencies need local build tools.

## Build Nodics

Run:

```bash
npm run build
```

The build command performs several important actions:

- Validates AI/developer governance rules.
- Checks copyright headers.
- Checks documentation coverage.
- Builds generated framework artifacts.
- Generates OpenAPI documentation.
- Regenerates LLM context.
- Generates governance reports.
- Verifies generated documentation coverage.

Generated artifacts should come from source definitions. If a generated file is wrong, fix the source definition and rebuild. Do not manually edit generated output as the long-term fix.

## Start Nodics

Run:

```bash
npm run start
```

This starts Nodics using the active local project/server configuration.

During startup, Nodics loads:

- Default framework configuration.
- Active module configuration.
- Environment configuration.
- Server configuration.
- Node configuration when applicable.
- Tenant and runtime configuration where configured.
- Schemas, routes, services, events, pipelines, and startup data.

If the server starts successfully, the logs will show the loaded modules and server ports.

## Start Nodics In Debug Mode

Use this when you want to set breakpoints before startup code runs:

```bash
npm run start:debug
```

This starts Node with the inspector and pauses before application startup. Visual Studio Code can attach on port `9229`.

Use this when you want the application to start immediately and attach later:

```bash
npm run start:inspect
```

For multiple Node processes, give each process a separate debug port:

```bash
npm run start:debug -- --port=9230
```

## Common First Checks

Run syntax validation:

```bash
npm run check:syntax
```

Run the main deterministic test gate:

```bash
npm run test:basic
```

Run the full gate, including modular topology:

```bash
npm run test:full
```

Run documentation checks:

```bash
npm run docs:coverage:source -- --limit=20
npm run docs:coverage:contracts -- --limit=20
```

## If Startup Fails

Check these areas in order:

1. Database connection values.
2. Active module configuration.
3. Environment, server, and node configuration.
4. Missing generated artifacts.
5. Invalid schema or route definitions.
6. Port conflicts.
7. Required initial data.
8. Permissions or tenant data.

Use the logs carefully. Nodics startup logs are intentionally detailed because startup problems often come from configuration hierarchy, not from one line of code.

