# nPipeline

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

## What To Avoid

Avoid:

- hardcoding pipeline node order in service code when source definitions can own it;
- swallowing node errors without trace context;
- putting business workflow state machines into generic pipelines;
- mutating global `PIPELINE` from random services;
- changing pipeline contracts without tests for default and override behavior.
