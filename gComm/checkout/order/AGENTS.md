# order Agent Contract

This file gives AI coding agents mandatory guidance for this Nodics module or package boundary.

## Inheritance

- Follow the root Nodics AI contract: `../../../AGENTS.md`.
- Follow the Commerce group contract: `../../AGENTS.md`.
- Follow the Checkout family contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../../../gSetup/llm/README.md`.
- If a deeper child module has its own `AGENTS.md`, follow that file for changes inside the child module.

## Module Work Rules

- Treat this directory as a layered Nodics module boundary when it contains `package.json`.
- Keep capabilities stable and make implementations replaceable through the module hierarchy.
- Do not hardcode project, environment, server, node, tenant, or customer behavior into reusable framework code.
- Put configurable behavior in layered configuration, schemas, routers, services, pipelines, data, and runtime governance.
- Update the concise `README.md`, canonical documentation content, `llm/` guidance, generated context, and tests whenever behavior or extension contracts change.
- Generated files must be recreated from source definitions; do not hand-maintain generated artifacts as source of truth.

## Order Calculation Contract

- Order calculation must be implemented through `orderValidationPipeline`, `orderEntryCalculationPipeline`, and `orderCalculationPipeline`.
- `orderCalculationPipeline` is the aggregate orchestrator. It validates the order, calculates/reconciles each order entry through `orderEntryCalculationPipeline`, then rolls up delivery, discount, tax, payment, refund, and order totals from accepted evidence.
- Order calculation must preserve historical checkout evidence. Recalculation is allowed only through explicit order-owned lifecycle operations such as amendment, return, refund, adjustment, or reconciliation.
- Checkout placement and reverse processing remain Workflow-owned business processes. Calculation pipelines divide the technical calculation task; they must not replace Workflow or hide Payment, Inventory, Fulfillment, or Promotion side effects inside Order.
- Customer modules may replace or extend individual pipeline nodes while preserving the parent/child pipeline shape and owning-module authority boundaries.

## Post-Order Lifecycle Request Contract

- Order owns the customer or operator business request for cancellation, return, or refund and its immutable order-entry evidence. Workflow owns submission, approval, and long-running orchestration.
- Fulfillment owns return shipment, pickup, receipt, inspection, and carrier evidence; Inventory owns reservation/allocation release and returned-stock disposition; Payment owns void, refund, provider, settlement, retry, and reconciliation evidence.
- `orderLifecycleRequest` and `orderLifecycleRequestItem` persistence is private. Mutations must pass the Order-owned orchestration flag and generated routers must remain disabled.
- Quantities must enter as validated positive decimal strings with Units-owned unit codes. Never normalize JavaScript numbers into commercial quantity evidence.
- The foundation models business intent only. Do not call providers, mutate adjacent-module state, or expose customer/BackOffice mutation APIs from persistence services.
- Persist request and item aggregates through `DefaultOrderLifecycleOrchestrationService` and the provider-neutral database transaction contract. Fail closed when atomic multi-record persistence is unavailable; never add a non-atomic fallback.
- Workflow submission must bind to an immutable request version, use a stable carrier identity, and recover through `SUBMISSION_PENDING`/`SUBMISSION_FAILED` rather than coordinating provider side effects in the caller.
- Cancellation eligibility must run through `orderCancellationEligibilityPipeline` as a deterministic, side-effect-free decision. Order may combine immutable Order quantities with normalized evidence supplied by Inventory, Fulfillment, Payment, and Product, but it must fail closed when an owner provider or per-entry evidence is unavailable.
- Eligibility and required-action output are plans only. Order must not release Inventory, cancel Fulfillment, void/refund Payment, or change Product policy from an eligibility node.
- All requested, ordered, already-resolved, releasable, and cancellable quantities must remain exact decimal strings and use Units-owned arithmetic; evidence units must match the selected Order Entry unit.
- Cancellation amount calculation must run through `orderCancellationCalculationPipeline`. Order supplies immutable line, Tax, Promotion, and original payment-allocation evidence; Payment owns proportional amount, currency rounding, split-payment allocation, and refund policy.
- Calculation output is immutable decision evidence only. It must not create Payment transactions, call providers, recalculate Tax or Promotion rules, or execute eligibility actions.
- `DefaultOrderCancellationWorkflowService` must invoke eligibility and calculation through their configured nPipeline names, bind outputs to the submitted lifecycle request version, and keep that version unchanged through approval routing.
- Manual approval must capture an authenticated human actor and enforce configured maker-checker separation. Automatic approval must be explicitly enabled and bounded by layered policy; the framework default remains manual review.
- Approval and rejection are Workflow decisions, not execution authorization shortcuts. `APPROVED` must still perform no Inventory, Fulfillment, Payment, or provider side effect.
- After approval, Workflow must invoke `orderCancellationExecutionPipeline`; Pipeline nodes delegate Fulfillment, Inventory, and Payment mutations to their owning services and checkpoint each completed owner step on the immutable lifecycle request.
- Cancellation execution retries must reuse the same request/version identities. Ambiguous partial execution becomes `RECONCILIATION_REQUIRED`; it must never be reported as completed or repaired through direct Order-side mutations.
- Order finalization may project exact cumulative cancelled quantities and `PARTIALLY_CANCELLED`/`CANCELLED` status only after required owner steps have completed, using revision guards and idempotent history evidence.
- Customer and support cancellation APIs are intent routes over private lifecycle persistence. Customer operations must reload the Order and enforce `order.customerCode`; support create-on-behalf must bind to the Order customer and its permissioned enterprise scope.
- Never accept client-supplied immutable Order snapshots. Intent services must reload entries and copy ordered quantity, Product identity, allocation references, and lifecycle revision before draft persistence.
- Lifecycle submission, evaluation, approval, rejection, execution checkpoints, cancellation, and completion require idempotent append-only Order history evidence.
- Return and Refund requests must select their own Workflow definitions. Never route non-cancellation lifecycle requests through cancellation handlers.
- Return validation and authorization are nPipelines; Workflow owns authorization and delegates RMA creation to Fulfillment. Fulfillment owns receipt/inspection and Inventory owns stock movement.
- Refund calculation and approval preparation are nPipelines. Workflow owns maker-checker approval and delegates provider execution to Payment using immutable original-transaction allocation evidence.
- Normalized lifecycle events may be published only after append-only Order history exists; events carry references and correlation identity, never raw provider or customer-secret payloads.
