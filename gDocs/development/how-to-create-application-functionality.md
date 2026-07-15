# How To Create Application Functionality

This guide explains how to decide where new code belongs.

Before writing code, identify the capability you are building.

Examples:

- User registration belongs near identity/profile behavior.
- A new scheduled cleanup belongs near scheduled-job behavior.
- A new import type belongs near import behavior.
- A new data provider belongs near database behavior.
- A customer-specific order rule belongs in the customer project module, not in framework order code.

## Step 1: Describe The Feature

Write one sentence:

```text
This feature allows <user or system> to <do something> so that <business outcome>.
```

If the sentence names a user-facing action, you probably need API, service, data, and test changes.

If the sentence names system automation, you may need configuration, scheduled jobs, events, or pipelines.

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

