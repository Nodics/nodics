# nbpm

`nbpm` is the framework workflow/process capability. It owns workflow schemas, workflow services, activity interceptors, event handling, carrier/item data builders, and workflow route contracts.

Use this module for generic business process behavior that belongs to the platform. Domain-specific processes should be contributed as workflow definitions and project modules layered above the framework.

Workflow changes must preserve source-of-truth definitions, validation, auditability, rollback safety, and test coverage because process behavior can coordinate multiple capabilities.

## Capability

`nbpm` provides:

- workflow schema definitions and generated CRUD/API contracts;
- workflow-to-schema mapping support;
- workflow carrier and item behavior;
- workflow lifecycle pipelines for assigned, released, blocked, paused, resumed, updated, filled, processed, action performed, channel evaluated, and error states;
- workflow event listeners and event dispatch;
- source carrier and source item data builders;
- workflow activity interceptors;
- workflow error handling;
- local and remote workflow initialization through `DefaultWorkflowService`.

Business workflow belongs here when it is stateful, lifecycle-driven, and coordinated through workflow definitions. Generic ordered execution without workflow state belongs in `nPipeline`.

## Runtime Flow

1. A workflow definition maps a business schema or search index into workflow behavior.
2. Interceptors assign default lifecycle events for workflow-to-schema mappings.
3. A carrier/action event triggers the configured workflow listener.
4. The listener starts the matching workflow lifecycle pipeline.
5. The lifecycle pipeline prepares schema/search context, mutates carrier/item state, and updates schema or search data.
6. The event layer records or dispatches lifecycle transitions.
7. Project modules can layer additional workflow definitions, actions, channels, and handlers.

If the workflow module is active locally, workflow items are initialized in-process. Otherwise `DefaultWorkflowService` builds a governed module request and uses the internal auth token for the target tenant.

## Extension Path

Projects extend workflow behavior by:

- contributing workflow definitions;
- adding schema-to-workflow mappings;
- adding workflow action/channel/carrier services;
- extending lifecycle pipelines;
- adding event listeners;
- adding carrier/item data builders;
- adding tenant-specific validation and access policy;
- testing lifecycle transitions, error handling, pause/resume/block/release behavior, and override paths.

Do not hardcode project-specific approval, fulfillment, enrichment, or publishing rules into the framework workflow module.

## Tests

Run:

```bash
node gFramework/nbpm/test/workflowLifecyclePipelineContract.test.js
node gFramework/nbpm/test/removeWorkflowProcessBehavior.test.js
npm run quality:docs
```

Workflow-generated contracts are also covered through generated schema/API/CRUD tests and topology gates.

## What To Avoid

Avoid:

- mixing generic pipeline behavior and business workflow lifecycle rules;
- bypassing workflow events and lifecycle pipelines for carrier state changes;
- losing tenant/auth context when workflow initialization crosses modules;
- editing generated workflow artifacts manually;
- adding project workflow rules directly to framework source.
