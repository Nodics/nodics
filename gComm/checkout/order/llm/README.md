# order LLM Context

This folder contains module-owned LLM context for `order`.

Human-authored files in this folder should explain module intent, ownership, extension rules, runtime contracts, and project customization guidance. Generated files must stay under `generated/` and are recreated from Nodics source definitions during build.

Recommended use:

1. Read `gSetup/llm/README.md` first for global Nodics rules.
2. Read this module context before changing `order`.
3. Read `generated/module-context.md`, `generated/schemas.md`, and `generated/tests.md` for current source-derived facts.
4. For project-specific overrides, read the later module layer before changing out-of-the-box Nodics code.

Do not hardcode this module into framework behavior. Use active modules, layered configuration, schemas, runtime governance, and tenant context.

For cancellation, return, and refund work, treat
`orderLifecycleRequest`/`orderLifecycleRequestItem` as private Order-owned
business-intent evidence. Preserve Workflow approval and Payment, Inventory,
and Fulfillment execution authority; never expose generated persistence as an
intent API.

Pre-fulfillment cancellation decisions run through
`orderCancellationEligibilityPipeline`. Treat normalized Inventory,
Fulfillment, Payment, and Product payloads as owner evidence, not Order-owned
state. Preserve exact Units arithmetic and never execute the planned release,
cancel, void, or refund actions from eligibility code.

For cancellation amounts, use `orderCancellationCalculationPipeline` and pass
immutable Order and allocation evidence to Payment's refund calculator. Do not
implement proportional money, currency rounding, Tax recalculation, Promotion
clawback, or provider execution inside Order.

Workflow must call those pipelines through
`DefaultOrderCancellationWorkflowService`; do not reimplement their nodes in a
Workflow action. Preserve the submitted request version through evaluation and
approval, default to manual review, enforce maker-checker for human approval,
and keep approved state separate from owner execution.
