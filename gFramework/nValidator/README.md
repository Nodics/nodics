# nValidator

`nValidator` applies reusable checks before or after important operations. A
validator can be selected by capability type, target item, lifecycle trigger,
tenant, and order, allowing projects to add policy without copying the
framework service that performs the operation.

`nValidator` owns the framework validation capability. It provides the persisted `validator.validator` schema, generated validator model/service/API contracts, tenant-aware validator loading, validator configuration storage, script execution support, update pipelines, and change listeners.

Use this module when validation behavior must be reusable across schemas, imports, exports, search, workflow, or scheduled jobs. Domain-specific validation rules should be contributed through validator records, handler services, scripts, or later project modules instead of being hardcoded into framework services.

## When To Use A Handler Or Script

Prefer a loader-visible handler service for business rules, external calls,
complex branching, reusable logic, or behavior that needs mocks and focused
tests. Use a script only for a small, trusted expression whose allowed context,
execution limits, ownership, and failure behavior are explicit.

Persisted scripts are executable behavior, not ordinary data. Production
deployments must treat authoring and mutation as a privileged control-plane
operation and qualify the configured script execution boundary. Do not assume
that validation alone makes arbitrary script text safe.

## Capability

Validators describe what should run, where it should run, and in what order.

The validator schema defines:

- `type`: one of `schema`, `import`, `export`, `search`, `workflow`, or `job`;
- `item`: the target item, or `default` when the validator applies broadly;
- `trigger`: the lifecycle trigger such as `preSave`, `postSave`, or a process-specific hook;
- `index`: ordering inside the trigger;
- `handler`: optional service method such as `DefaultSampleValidatorService.handlePreSave`;
- `script`: optional script expression evaluated through the platform utility path.

The module loads validator records per active tenant, groups them by type, item, and trigger, and sorts them by `index` before execution.

## Runtime Flow

1. `DefaultValidatorService.loadValidators` reads validator records for active tenants when the generated model service is available.
2. `loadRawValidators` validates validator type and trigger, defaults blank `item` to `default`, and merges validator definitions into `DefaultValidatorConfigurationService`.
3. `prepareItemValidators` resolves tenant-specific validators for a type and item, merges default and item-specific validators, groups them by trigger, and sorts by index.
4. `executeValidators` runs each validator through a configured handler service or through script evaluation.
5. Validator change events start `validatorUpdatedPipeline` so runtime validator configuration can be refreshed.

## Source Contracts

- `src/schemas/schemas.js` owns the persisted validator schema.
- `src/utils/enums.js` owns the supported validator type enum.
- `src/service/config/defaultValidatorConfigurationService.js` owns raw validator storage and trigger ordering.
- `src/service/validator/defaultValidatorService.js` owns tenant loading, validation, execution, and change-event handling.
- `src/service/validator/defaultValidatorScriptExecutionService.js` owns script execution support.
- `src/service/pipeline/defaultValidatorUpdatedPipelineService.js` owns update pipeline behavior.
- `src/event/listeners.js`, `src/pipelines/pipelines.js`, and `src/interceptors/interceptors.js` keep loader-visible extension points.

## Extension Path

Projects may extend validation by:

- adding validator data records for their schemas, imports, exports, search indexes, workflows, or jobs;
- adding handler services in later active modules;
- overriding validator configuration or execution services through the standard service loader;
- contributing additional pipeline or listener behavior in later modules;
- extending the validator schema only when the capability contract requires new persisted metadata.

Use handler services for business behavior that must be testable and overrideable. Use scripts only for small expressions that do not hide complex business rules.

## Configuration

`config/properties.js` is currently an empty baseline. Add configurable validator policy there only when a reusable default is needed, such as script execution policy, diagnostic behavior, or validation limits.

Do not create parallel validator configuration files. Validator defaults belong in `config/properties.js`; validator runtime records belong in the validator model/data path.

## Security, Isolation, And Failure Behavior

- Resolve validators within the active tenant and supported type/trigger
  catalog.
- Restrict validator creation and updates with action-specific permissions and
  the runtime exposure policy appropriate to the deployment.
- Do not expose secrets, credentials, or unrestricted request objects to a
  script context.
- Define whether a validator failure rejects the operation, records a warning,
  or triggers compensation; security and data-integrity checks should fail
  closed.
- Bound execution count and duration so a validator cannot silently create an
  unbounded high-volume path.
- Preserve validator identity, type, item, trigger, order, tenant, correlation,
  handler, duration, and safe failure classification in diagnostics.

## Tests

The module owns generated schema/API/CRUD tests and focused service coverage:

- generated validator schema, API, API scenario, and CRUD scenario tests;
- `test/validatorServiceContract.test.js`, which verifies tenant loading, type validation, trigger ordering, handler execution, script execution, invalid tenant rejection, and validator change pipeline dispatch.

Run focused validation with:

```bash
node gFramework/nValidator/test/validatorServiceContract.test.js
npm run test:generated
npm run quality:docs
```

## What To Avoid

Avoid:

- hardcoding customer validation rules into framework services;
- bypassing tenant-specific validator resolution;
- adding validator types without updating enum, schema, tests, and docs;
- hiding complex validation behavior in scripts when a service handler is needed;
- changing validator ordering without contract tests;
- treating generated validator artifacts as the source of truth.

## Operations And Common Mistakes

Monitor load failures, invalid records, execution duration, rejection counts,
script/handler failures, and change-event refresh results. Avoid embedding
customer rules in framework source, using scripts as hidden services, allowing
ambiguous duplicate order, or mutating the runtime validator registry outside
its model/event contract.

## Continue

- Application functionality: [How To Create Application Functionality](../../gDocs/development/how-to-create-application-functionality.md)
- Data contracts: [How To Work With Data](../../gDocs/data/how-to-work-with-data.md)
- Runtime governance: [nDynamo](../nDynamo/README.md)
- Framework map: [gFramework](../README.md)
