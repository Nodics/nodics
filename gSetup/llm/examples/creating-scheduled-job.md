# Example: Creating A Scheduled Job

Use this example when a developer asks for recurring work, periodic cleanup, scheduled imports, retries, notifications, synchronization, or batch processing.

## Scenario

Run a scheduled import that checks a governed import location for pending product catalog files.

## Correct Ownership

The job definition belongs to the module that owns the business process.

- A framework-wide scheduling capability belongs to the scheduled-job capability module.
- A product catalog import job belongs to the project or catalog module that owns that catalog process.
- Environment-specific schedules belong in environment/server/node configuration.
- Node-specific execution responsibility belongs to the node or server topology, not hardcoded service logic.

## Correct Layering

Use this order:

1. Define or configure the CronJob record through module-owned data or governed runtime configuration.
2. Put schedule defaults, enablement flags, retry policy, and node responsibility in `config/properties.js`.
3. Put job behavior in a loader-visible service under `src/service`.
4. Use pipelines, interceptors, or events when the job participates in a larger process.
5. Use import/export/search/cache/event services instead of direct provider calls.
6. Add tests for schedule configuration, service behavior, tenant behavior, and failure handling.
7. Update module README, public docs when user-facing, and generated LLM context.

## Service Style

Job services must be overrideable:

```js
module.exports = {
    processPendingCatalogFiles: function (request) {
        return new Promise((resolve, reject) => {
            // Resolve tenant, find governed files, call import service, record diagnostics.
            resolve({ status: 'COMPLETED' });
        });
    }
};
```

Do not place job behavior in a standalone script when it needs Nodics configuration, tenant context, audit, import/export, or module override behavior.

## Tests

Add tests for:

- job definition and schedule metadata;
- disabled job behavior;
- responsible node or server behavior when topology matters;
- service success behavior;
- failure and retry behavior;
- tenant-specific execution;
- event or pipeline behavior when the job triggers downstream processing;
- project override behavior.

## Verification

```bash
npm run test:cronjob
npm run test:basic
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Run topology tests when the job is responsible for cross-node behavior.

## What To Avoid

Avoid:

- hardcoding schedules in source code when configuration can own them;
- running the same job on every node without a responsibility rule;
- bypassing import/export or provider services;
- writing files to root `temp` or unmanaged folders;
- adding jobs without audit or diagnostics;
- using sample data as production initialization.
