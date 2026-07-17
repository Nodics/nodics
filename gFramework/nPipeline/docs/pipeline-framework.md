# Nodics Pipeline Framework

Pipelines are the Nodics mechanism for running ordered, configurable, and
overrideable runtime behavior. A pipeline turns a business or platform process
into named steps. Each step is visible in source, can be tested independently,
and can be extended by a later active module without changing out-of-the-box
framework code.

Use this guide when you need to understand, define, extend, customize, or test a
Nodics pipeline.

## What A Pipeline Is

A pipeline is a named process definition stored in
`src/pipelines/pipelines.js`. It contains:

- `startNode`: the first node to execute.
- `hardStop`: whether nested pipeline errors should stop the parent pipeline.
- `handleError`: the error handler node to use.
- `nodes`: named execution steps.

Each node points to either:

- a service function, using `type: 'function'` and a handler such as
  `DefaultModelsGetInitializerService.validateRequest`; or
- another pipeline, using a non-function type such as `type: 'process'` and a
  handler such as `modelQueryBuilderPipeline`.

At runtime, callers start a pipeline through:

```javascript
SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
```

The request object carries tenant, module, schema, route, auth, model, query,
search, import, or event context. The response object is the shared accumulator
used by pipeline nodes to pass success, error, target, and intermediate output
through the chain.

## Why Pipelines Exist

Pipelines make framework behavior configurable without hiding it inside one
large service method. They give Nodics a consistent way to apply:

- validation;
- access checks;
- query building;
- default value application;
- interceptors;
- validators;
- processors;
- persistence or provider calls;
- cache lookup and invalidation;
- response shaping;
- event dispatch;
- diagnostics and error traceability.

The important principle is simple: when behavior needs ordered lifecycle
control, the order belongs in a pipeline definition, and the implementation of
each step belongs in loader-visible services.

## Runtime Flow

1. Active modules are resolved by Nodics startup.
2. `nPipeline` loads every active module's `src/pipelines/pipelines.js`.
3. Definitions are merged through the active module hierarchy.
4. Persisted pipeline models are merged when the generated pipeline model
   service is available.
5. A service, controller, facade, router, listener, cron job, or another
   pipeline starts a named pipeline through `DefaultPipelineService.start`.
6. `DefaultPipelineService` merges `defaultPipeline` with the requested
   pipeline.
7. `PipelineHead` builds `PipelineNode` instances from the effective
   definition.
8. `PipelineHead` executes the `startNode`.
9. Each node calls `process.nextSuccess`, `process.stop`, or `process.error`.
10. Success reaches `successEnd`; errors reach `handleError`.

The base `defaultPipeline` contributes standard terminal nodes:

```javascript
module.exports = {
    defaultPipeline: {
        nodes: {
            successEnd: {
                type: 'function',
                handler: 'DefaultPipelineService.handleSucessEnd'
            },
            handleError: {
                type: 'function',
                handler: 'DefaultPipelineService.handleErrorEnd'
            }
        }
    }
};
```

Every concrete pipeline automatically receives these terminal nodes unless a
later layer intentionally overrides them.

## Pipeline Node Contract

A normal service-backed node has this shape:

```javascript
validateRequest: {
    type: 'function',
    handler: 'DefaultModelsGetInitializerService.validateRequest',
    success: 'checkAccess'
}
```

The handler must be a loader-visible service function with this signature:

```javascript
validateRequest: function (request, response, process) {
    if (!request || !request.schemaModel) {
        process.error(request, response, new CLASSES.NodicsError('Invalid request'));
        return;
    }
    process.nextSuccess(request, response);
}
```

A handler must:

- read required input from `request`;
- write shared output to `request` or `response` only when that output belongs
  to the lifecycle contract;
- call exactly one of `process.nextSuccess`, `process.stop`, or
  `process.error`;
- return immediately after `process.error` when the function could otherwise
  continue;
- preserve tenant, auth, module, schema, route, search, import, and event
  context;
- use framework error classes such as `CLASSES.NodicsError`,
  `CLASSES.SearchError`, `CLASSES.DataError`, or the owning module's error type.

Do not hide pipeline behavior in private closures or files outside
`src/service`. A later module must be able to override one function without
copying an entire framework file.

## Success, Stop, Target, And Error

`process.nextSuccess(request, response)` moves to the node named by the current
node's `success` property.

`process.stop(request, response, success)` skips the remaining normal nodes and
routes directly to `successEnd`. Use it when the pipeline has completed early,
such as a cache hit.

`response.targetNode` supports branching when a node has a success map:

```javascript
redirectRequest: {
    type: 'function',
    handler: 'DefaultRequestHandlerPipelineService.redirectRequest',
    success: {
        securedRequest: 'handleSecuredRequest',
        nonSecureRequest: 'handleNonSecuredRequest'
    }
}
```

The handler sets `response.targetNode = 'securedRequest'` or
`response.targetNode = 'nonSecureRequest'`, and `PipelineHead` chooses the next
node.

`process.error(request, response, error)` enriches the error with pipeline
context, then routes to the configured error node. Error context can include
pipeline name, pipeline id, node name, handler, tenant, module, schema, index,
event, import run, route, and operation details.

## Processors Are Not Pipeline Nodes

A processor is a configured handler that transforms or prepares data. A
pipeline node can execute processors, but the processor itself is not the
pipeline controller.

For example, the database bulk save pipeline has a `preProcessor` node:

```javascript
preProcessor: {
    type: 'function',
    handler: 'DefaultModelsSaveInitializerService.preProcessor',
    success: 'processModels'
}
```

That node reads schema interceptor configuration such as `preSaveProcessor` and
uses `DefaultProcessorHandlerService.executeProcessors` to run the configured
processor handlers sequentially.

This separation matters:

- the pipeline owns lifecycle order;
- the service node owns the step behavior;
- the processor owns targeted data transformation;
- schema, search, import, or export definitions decide which processors apply;
- later modules can override any of those layers independently.

Use processors for data transformation, enrichment, normalization, mapping, or
target-contract shaping. Use pipelines for lifecycle orchestration.

## Real Example: API Request Pipeline

`gFramework/nRouter/src/pipelines/pipelines.js` defines
`requestHandlerPipeline`.

The request pipeline handles every API request before a controller is called:

1. `helpRequest`: handles framework help behavior.
2. `parseHeader`: normalizes request headers.
3. `parseBody`: normalizes request body.
4. `handleSpecialRequest`: handles special framework request cases.
5. `redirectRequest`: chooses secured or non-secured flow.
6. `handleSecuredRequest`: runs `handleSecuredRequestPipeline`.
7. `handleNonSecuredRequest`: runs `handleNonSecuredRequestPipeline`.
8. `lookupCache`: checks API response cache.
9. `handleRequest`: dispatches to the registered controller.
10. `successEnd`: returns the success response.

The secured branch validates the secured request, API key, auth token, request
data, and access. The non-secured branch resolves enterprise and tenant
context. This is why route security decisions are made before controller
execution and why login routes can remain pre-authentication while internal
token routes stay secured.

When customizing request behavior, add a later-module pipeline definition and
service function for the new step. Examples include request tracing, rate
limits, custom tenant lookup, request normalization, or additional access
checks.

## Real Example: Database Get Pipeline

Generated CRUD services call:

```javascript
SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
```

`modelsGetInitializerPipeline` performs the schema read lifecycle:

1. `validateRequest`: verifies required request and schema context.
2. `checkAccess`: verifies read permission.
3. `buildQuery`: prepares effective query.
4. `buildOptions`: prepares query options.
5. `lookupCache`: returns early on DAO/schema-item cache hit.
6. `applyPreInterceptors`: runs configured pre-read interceptors.
7. `applyPreValidators`: runs configured pre-read validators.
8. `executeQuery`: calls the active model/DAO implementation.
9. `populateSubModels`: populates configured relations.
10. `populateVirtualProperties`: computes virtual properties.
11. `applyPostValidators`: runs post-read validators.
12. `applyPostInterceptors`: runs post-read interceptors.
13. `updateCache`: stores cacheable results.
14. `applyReadAccessPolicies`: removes data the caller cannot see.

This pipeline is tenant-aware, schema-aware, cache-aware, and access-policy
aware. A customer project should customize read behavior by changing schema
configuration, interceptors, validators, services, or a later pipeline
definition. It should not edit generated CRUD services.

## Real Example: Database Save Pipelines

Bulk save and single save are intentionally split.

`modelsSaveInitializerPipeline` handles the bulk request:

1. `validateInput`: requires a non-empty model list.
2. `preProcessor`: runs configured bulk pre-save processors.
3. `processModels`: delegates each model to `modelSaveInitializerPipeline`.
4. `postProcessor`: runs configured bulk post-save processors.
5. custom `successEnd`: returns bulk success and failure details.

`modelSaveInitializerPipeline` handles one model:

1. `validateModel`: verifies object input.
2. `checkAccess`: verifies write permission.
3. `enforceCreateAccessPolicies`: applies schema create policies.
4. `buildQuery`: runs `modelQueryBuilderPipeline`.
5. `applyDefaultValues`: applies schema defaults.
6. `removeVirtualProperties`: removes non-persistent values.
7. `applyPreInterceptors`: runs pre-save interceptors.
8. `applyPreValidators`: runs pre-save validators.
9. `applyValidators`: runs schema validators.
10. `handleNestedModelsSave`: persists nested models when configured.
11. `saveModel`: calls the active model/DAO implementation.
12. `populateSubModels`: populates configured relations.
13. `populateVirtualProperties`: computes virtual values.
14. `applyPostValidators`: runs post-save validators.
15. `applyPostInterceptors`: runs post-save interceptors.
16. `triggerModelChangeEvent`: emits model change events.
17. `invalidateRouterCache`: clears API response cache.
18. `invalidateSchemaItemCache`: clears schema-item cache.
19. `successEnd`: returns the saved model.

This design lets bulk behavior, single-model behavior, query building, default
values, validation, nested save, cache invalidation, and events be customized
independently.

## Real Example: Search Pipelines

Search modules define provider-neutral search lifecycles. Examples include:

- `doGetModelsInitializerPipeline`;
- `doSearchModelInitializerPipeline`;
- `doSaveModelsInitializerPipeline`;
- `doRefreshIndexInitializerPipeline`;
- `doHealthCheckClusterInitializerPipeline`;
- indexer pipelines.

The `doSearchModelInitializerPipeline` follows the same lifecycle style as
database get:

1. validate request and search model;
2. build search options;
3. check search cache;
4. apply pre interceptors;
5. apply pre validators;
6. execute provider query;
7. populate virtual properties;
8. apply post validators;
9. apply post interceptors;
10. update search cache;
11. return the response.

The search indexer uses processors differently: index definitions can configure
processors that run while indexer data is being fetched and shaped. Those
processors should be used for search-specific transformation, not for changing
the pipeline engine.

## Defining A New Pipeline

Create or update the owning module's `src/pipelines/pipelines.js`.

Example:

```javascript
module.exports = {
    sampleApprovalPipeline: {
        startNode: 'validateRequest',
        hardStop: true,
        handleError: 'handleError',
        nodes: {
            validateRequest: {
                type: 'function',
                handler: 'DefaultSampleApprovalPipelineService.validateRequest',
                success: 'loadContext'
            },
            loadContext: {
                type: 'function',
                handler: 'DefaultSampleApprovalPipelineService.loadContext',
                success: 'applyRules'
            },
            applyRules: {
                type: 'function',
                handler: 'DefaultSampleApprovalPipelineService.applyRules',
                success: 'successEnd'
            }
        }
    }
};
```

Then create a loader-visible service, for example
`src/service/pipeline/defaultSampleApprovalPipelineService.js`:

```javascript
module.exports = {
    validateRequest: function (request, response, process) {
        if (!request || !request.tenant) {
            process.error(request, response, new CLASSES.NodicsError('Tenant is required'));
            return;
        }
        process.nextSuccess(request, response);
    },

    loadContext: function (request, response, process) {
        response.context = response.context || {};
        process.nextSuccess(request, response);
    },

    applyRules: function (request, response, process) {
        response.success = {
            code: 'SUC_SAMPLE_00000',
            result: response.context
        };
        process.nextSuccess(request, response);
    }
};
```

The service file should follow the normal Nodics export-style contract so a
later module can override only `applyRules` or any other individual function.

## Extending An Existing Pipeline

To extend a framework pipeline from a customer/project module:

1. Create the same `src/pipelines/pipelines.js` contribution in the later
   active module.
2. Define only the pipeline nodes that need to change or be added.
3. Add new service functions under `src/service`.
4. Preserve request, response, tenant, auth, and error contracts.
5. Add tests proving the effective pipeline order and behavior.
6. Regenerate generated context.

Example: add a customer audit step after database save events:

```javascript
module.exports = {
    modelSaveInitializerPipeline: {
        nodes: {
            triggerModelChangeEvent: {
                type: 'function',
                handler: 'DefaultModelSaveInitializerService.triggerModelChangeEvent',
                success: 'writeCustomerAudit'
            },
            writeCustomerAudit: {
                type: 'function',
                handler: 'DefaultCustomerModelAuditPipelineService.writeCustomerAudit',
                success: 'invalidateRouterCache'
            }
        }
    }
};
```

The custom service belongs in the customer/project module:

```javascript
module.exports = {
    writeCustomerAudit: function (request, response, process) {
        // Write audit using tenant and schema context from request.
        process.nextSuccess(request, response);
    }
};
```

Do not copy the full framework pipeline unless the whole lifecycle is being
replaced. A focused node contribution keeps the custom module smaller and makes
future framework upgrades easier.

## Replacing A Node Implementation

When the pipeline order is correct but one step needs custom behavior, override
the service method rather than changing the pipeline definition.

Framework service:

```javascript
module.exports = {
    applyDefaultValues: function (request, response, process) {
        // framework behavior
    }
};
```

Later module service with the same loader-visible service name:

```javascript
module.exports = {
    applyDefaultValues: function (request, response, process) {
        // customer behavior
        process.nextSuccess(request, response);
    }
};
```

Because services are merged through active module hierarchy, this replaces only
that function while keeping the rest of the framework service intact.

## Runtime Pipeline Configuration

Source definitions are the primary source of truth. Runtime pipeline models can
also update the effective `PIPELINE` registry when the pipeline schema and
generated service are available. Runtime changes are handled through
`pipelineSave`, `pipelineUpdated`, and pipeline removal events.

Use runtime pipeline models for governed activation, tenant-aware operational
changes, or admin-managed behavior where the platform explicitly supports it.
Do not use runtime pipeline models as a hidden architecture source. Source,
tests, module guidance, and generated context must still describe the capability
contract.

## Testing Pipeline Changes

Every pipeline change needs tests at the right boundary.

For framework pipeline changes, add tests beside the owning module. Recent
examples include:

- `gFramework/nRouter/test/requestPipelineResponseContract.test.js`;
- `gFramework/nDatabase/database/test/modelsGetInitializerPipelineContract.test.js`;
- `gFramework/nDatabase/database/test/modelSaveInitializerPipelineContract.test.js`;
- `gFramework/nDatabase/database/test/modelsSaveInitializerPipelineContract.test.js`;
- `gFramework/nDatabase/database/test/modelsRemoveUpdateInitializerPipelineContract.test.js`;
- `gFramework/nSearch/search/test/searchPipelineInitializerContract.test.js`.

Tests should prove:

- invalid input is rejected early;
- access and tenant context are preserved;
- cache hit paths do not mutate cached objects;
- processors, validators, and interceptors are called in the expected order;
- nested pipelines receive cloned or isolated mutable input where required;
- partial failures are reported safely;
- success and error responses have stable shapes;
- errors include useful pipeline context;
- a later module can override the intended extension point.

Run the focused test first, then the owning suite. Regenerate LLM context after
source or documentation changes:

```bash
node gFramework/nTooling/bin/nodics-tool.js test:suite --suite=governance
node gFramework/nTooling/bin/nodics-tool.js test:suite --suite=search
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

## Documentation Checklist

When adding or changing a pipeline, update:

- the owning module `README.md`;
- the owning module `docs/` page when the behavior needs detailed explanation;
- `AGENTS.md` or module `AGENTS.md` when AI/developer behavior changes;
- LLM contracts or examples under `gSetup/llm` when the rule is cross-module;
- generated LLM context by running `npm run llm:generate`.

Document the pipeline's purpose, owner, start node, node order, request shape,
response shape, tenant/auth assumptions, processors/interceptors/validators,
side effects, failure behavior, customization path, and tests.

## What To Avoid

Avoid:

- editing out-of-the-box framework files for customer-only behavior;
- creating pipeline-support services outside `src/service`;
- exporting a single function when the service should export mergeable object
  members;
- hardcoding tenant, server, node, customer, provider, index, database, queue,
  or file path values in pipeline handlers;
- swallowing errors instead of calling `process.error`;
- calling both `process.error` and `process.nextSuccess` from one failure path;
- mutating cached data returned from cache without cloning it first;
- using processors to hide lifecycle order;
- using pipelines for business workflow state machines that belong to workflow
  modules;
- changing generated services directly instead of changing definitions and
  regenerating.

