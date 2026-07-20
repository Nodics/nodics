# nPipeline

`nPipeline` runs a named sequence of technical processing steps. It is useful
when an operation must pass through an ordered, configurable lifecycle—for
example validation, initialization, persistence, or post-processing—while
allowing a later module to replace or reorder specific steps.

`nPipeline` owns configurable execution pipelines used to compose ordered
runtime behavior.

Detailed pipeline framework documentation is maintained in
[docs/pipeline-framework.md](docs/pipeline-framework.md).

Pipeline guidance covers configurable process-style execution: a definition is
a series of nodes where each step can decide the next operation. Nodics uses
pipeline and workflow terminology in different places, so verify the owning
source before moving behavior. Pipeline behavior belongs here when it is
framework-level ordered execution; business workflow belongs in workflow
modules.

## When To Use A Pipeline

Use a pipeline when the sequence itself is part of the platform or capability
contract and needs named steps, shared context, error traceability, and layered
overrides. Use an ordinary service for a small cohesive behavior. Use workflow
modules when the business process has durable state, carriers, actions,
waiting, human decisions, retries across time, or business-visible lifecycle.

## Ownership

`nPipeline` may own:

- pipeline definition loading;
- ordered node execution;
- context propagation between nodes;
- error and trace handling;
- extension points for later modules to add, replace, disable, or reorder
  nodes.

## Extension Contract

Pipeline changes must preserve execution order, context propagation, error
traceability, and override behavior. Later modules should customize pipelines
through source definitions and configuration, not by editing framework runtime
code.

Tests must cover default execution and a later-loaded module override whenever
pipeline behavior changes.

## Capability

`nPipeline` provides:

- effective pipeline definition loading from active modules;
- optional merge with persisted pipeline models when the pipeline schema/service is available;
- runtime update and removal handling through events;
- `PipelineHead` and `PipelineNode` execution primitives;
- default success and error terminals;
- named pipeline execution through `DefaultPipelineService.start`;
- global effective `PIPELINE` registry management;
- source extension slots for pipeline definitions and interceptors.

Pipelines are process chains. Each node receives request, response, and process context and decides whether to continue, fail, or finish.

## Runtime Flow

1. Startup loads `src/pipelines/pipelines.js` from active modules.
2. Persisted pipeline models are merged when the generated pipeline model service is available.
3. A caller starts a named pipeline through `DefaultPipelineService.start(name, request, response)`.
4. The service merges `defaultPipeline` with the named pipeline definition.
5. `PipelineHead` builds ordered nodes and starts execution.
6. Nodes call success, error, or terminal handlers.
7. Failures are enriched with pipeline name, pipeline id, node name, tenant, and module context.

Runtime pipeline model changes can update or remove entries from the effective `PIPELINE` registry through change events.

## Definition Guidance

A pipeline definition should document:

- pipeline purpose;
- owning module;
- expected request shape;
- response shape;
- node order;
- success and error transitions;
- tenant and auth assumptions;
- side effects;
- diagnostics;
- tests.

Use pipelines when behavior needs ordered, configurable, replaceable processing. Use workflow modules for business workflow lifecycle, state, and carrier/action orchestration.

Pipeline nodes orchestrate lifecycle steps. Processors are configured handlers
that may run inside a node to transform data or satisfy an import/export/search
contract. Do not use processors as hidden pipeline controllers.

## Tests

Run:

```bash
npm run quality:docs
npm run docs:coverage:source -- --limit=20
```

When changing runtime pipeline behavior, add focused tests that prove default execution, error enrichment, dynamic update/removal, and later-module overrides.

The current repository also exercises pipeline contracts through consumer
modules such as generated database save/get/update/remove pipelines, search,
workflow, cronjob, and runtime schema governance. A change to the generic engine
must run those consumer regressions because they are part of the effective
contract.

## What To Avoid

Avoid:

- hardcoding pipeline node order in service code when source definitions can own it;
- swallowing node errors without trace context;
- putting business workflow state machines into generic pipelines;
- mutating global `PIPELINE` from random services;
- changing pipeline contracts without tests for default and override behavior.

## Integration, Observability, And Performance

Pipeline request and response objects are contracts shared with their caller.
Each node must document required input, output mutation, side effects, tenant
and authorization assumptions, and whether retry or repeated execution is safe.

Trace failures with pipeline name/id, node, module, tenant, correlation, and the
original safe cause. Do not swallow errors or log secret-bearing request data.
Keep synchronous nodes bounded; move long-running or durable business work to
the appropriate job, event, messaging, or workflow capability.

## Common Mistakes

- Using a pipeline as an unstructured list of hidden service calls.
- Using a processor as a second pipeline controller.
- Storing business workflow state only in in-memory pipeline context.
- Mutating the global registry outside its loader/event contract.
- Adding a node without defining error and repeated-execution behavior.

## Continue

- Detailed framework: [Pipeline Framework](docs/pipeline-framework.md)
- Public platform guide: [How Platform Capabilities Work](../../gDocs/platform/how-platform-capabilities-work.md)
- Business workflow modules: [workflow](../../gCore/workflow/README.md)
- Framework map: [gFramework](../README.md)
