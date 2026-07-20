# How To Create Application Functionality

This guide explains how to decide where new code belongs.

Before writing code, identify the capability you are building.

Examples:

- User registration belongs near identity/profile behavior.
- A new scheduled cleanup belongs near scheduled-job behavior.
- A new import type belongs near import behavior.
- A new data provider belongs near database behavior.
- A customer-specific order rule belongs in the customer project module, not in framework order code.

For practical task-by-task examples, read [Common Implementation Examples](common-implementation-examples.md). It shows how to create APIs, schemas, providers, scheduled jobs, and runtime configuration changes using the same ownership and verification rules.

## Beginner Summary

In Nodics, you do not start by asking "which file can I edit?" You start by
asking "which capability owns this behavior?"

A capability is a business or platform area such as profile, order, cache,
import, search, workflow, scheduled jobs, or runtime configuration. Once the
capability is clear, the layer becomes easier:

- route exposes an API;
- controller reads the HTTP request and prepares the Nodics request context;
- facade coordinates one use case;
- service implements business behavior;
- schema defines data shape and generated CRUD behavior;
- DAO/provider talks to a database or external provider;
- pipeline defines ordered processing steps;
- interceptor validates or hooks into lifecycle behavior;
- config stores policy, provider choice, limits, and topology;
- data folders store initial, core, sample, or importable records;
- tests prove the behavior and the override path.

The safest beginner workflow is:

```text
Describe feature -> choose owner -> choose layer -> write small code -> add tests -> regenerate artifacts -> update docs
```

## Step 1: Describe The Feature

Write one sentence:

```text
This feature allows <user or system> to <do something> so that <business outcome>.
```

If the sentence names a user-facing action, you probably need API, service, data, and test changes.

If the sentence names system automation, you may need configuration, scheduled jobs, events, or pipelines.

Examples:

| Requirement | Likely owner | Likely layers |
| --- | --- | --- |
| Customer can save a delivery preference | Customer project or profile module | schema, route, controller, facade, service, tests |
| Product catalog must be exported nightly | Catalog/data project module | cronjob, export service, pipeline, config, tests |
| One tenant uses a private database | Tenant/runtime configuration plus database provider | config, tenant record, DAO/provider tests |
| Admin can flush a cache channel | Cache/system capability | router, permission, service, audit, tests |
| Import must reject invalid CSV rows but continue valid rows | Import capability or project import module | import pipeline, interceptor, config, tests |

## Step 2: Choose The Owner

Ask:

- Is this framework behavior?
- Is this project-specific behavior?
- Is this environment-specific behavior?
- Is this tenant-specific behavior?
- Is this a provider implementation?

Do not add code to a shared framework module just because it is convenient. Use a project module when the behavior is customer-specific.

## Step 3: Choose The Right Layer

Use services for business behavior.

Use controllers for request handling.

Use facades for orchestration across services or capability boundaries.

Use schemas for data shape.

Use routes for API exposure.

Use pipelines and interceptors for extension points around a process.

Use configuration for policy and environment-dependent values.

Use data folders for initial or sample data.

Use tests to prove default behavior and override behavior.

## Layer Decision Table

Use this table when you are unsure where code belongs:

| Question | If yes, write here |
| --- | --- |
| Does this expose an HTTP endpoint? | `src/router/routers.js` plus controller/facade/service |
| Does this read path, query, header, or body values? | `src/controller/**/*Controller.js` |
| Does this coordinate multiple services or modules? | `src/facade/**/*Facade.js` |
| Does this implement business logic? | `src/service/**/*Service.js` |
| Does this define a data model or generated CRUD API? | `src/schemas/schemas.js` |
| Does this change database provider behavior? | Provider module DAO/service layer |
| Does this add a step to an ordered process? | `src/pipelines/pipelines.js` and service method |
| Does this validate or hook before/after lifecycle behavior? | `src/interceptors/interceptors.js` or pipeline node |
| Does this define a setting or policy? | `config/properties.js` |
| Does this load default records at startup? | Module `data/initial` or appropriate data folder |
| Does this provide examples users can import manually? | Module `data/sample` or documented import path |
| Does this prove behavior? | Module `test/` |

Do not place business behavior in `config/`, routers, generated files, or
one-off helper folders.

## Step 4: Follow Standard Service Style

Nodics services should export functions from `module.exports`.

Example:

```js
module.exports = {
    createPlan: function (options) {
        return {
            executableByDefault: false,
            requiresExplicitApproval: true
        };
    }
};
```

This style allows later modules to override or merge behavior through the standard Nodics service loading pattern.

Avoid creating custom folders or export styles that the Nodics loader cannot see.

## Step 5: Add Tests

At minimum, test:

- The default behavior.
- The project override behavior if the feature is meant to be customized.
- Permission behavior if the feature is exposed through APIs.
- Validation behavior for invalid input.
- Tenant behavior if data or configuration can vary by tenant.

For a beginner, think of tests as the proof that your code is in the right
place. If you cannot write a focused test for the owner and layer, the behavior
may be in the wrong place.

## Step 6: Update Documentation

Update:

- The module README if the module behavior changed.
- Public documentation if users need to learn the feature.
- AI/developer contracts if the extension rule changed.
- Generated context if source behavior changed.

Run:

```bash
npm run llm:generate
npm run llm:validate
```

## What To Avoid

Avoid:

- Editing framework files for customer-specific behavior.
- Creating helper code outside the loader-visible folders.
- Hiding policy in controller code.
- Duplicating configuration rules.
- Manually editing generated files.
- Adding behavior without tests.

## Before You Finish

Use this checklist:

- The owning module is clear.
- The code is in a loader-visible Nodics folder.
- Service/controller/facade files use `module.exports`.
- Configuration values live in `config/properties.js`.
- Security and permissions are visible in route metadata.
- Tenant behavior is explicit when data, cache, search, files, jobs, or events are involved.
- Generated artifacts were regenerated when schemas, routes, OpenAPI, tests, or LLM context changed.
- Documentation explains where future developers or AI tools should customize the behavior.

## Continue

- Beginner journey: [Build Your First Nodics Capability](../getting-started/build-your-first-capability.md)
- Next: [How To Customize And Extend Nodics](how-to-customize-and-extend-nodics.md)
- Testing: [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md)
- Documentation home: [Nodics Documentation](../README.md)
