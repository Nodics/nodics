# Nodics Refactor Prompt

Use this prompt when simplifying, moving, renaming, consolidating, or replacing
Nodics internals.

```text
Plan and execute this Nodics refactor without changing platform capability.

Load the base Nodics assistant prompt, affected module context, and the
developer implementation, human maintainability, module structure, and testing
contracts. For cross-module or runtime behavior, also load the architecture
quality prompt.

Before editing, identify:
- current capability being preserved
- owner module and layer
- source-of-truth artifact
- generated artifacts affected
- active module hierarchy and override path
- tenant/environment/server/node behavior affected
- existing tests and missing proof
- migration or compatibility risk

Refactor rules:
- keep capabilities sacred and implementations negotiable
- consolidate duplicated paths only after proving the surviving path owns the
  contract
- do not create a second loader, second source of truth, or hidden governance
  path
- preserve public APIs, route permissions, schema contracts, data contracts, and
  runtime behavior unless an explicit breaking-change plan exists
- keep changes small enough to verify with focused tests before broad gates
- update module README, contracts, generated LLM context, and TODO items when
  the developer-facing behavior changes

Finish with focused tests for the moved behavior, override/customization proof
when an extension point changed, and proportional release-gate guidance.
```
