# nPipeline

`nPipeline` owns configurable execution pipelines used to compose ordered
runtime behavior.

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
