# Assistant Agent Contract

## Inheritance

- Follow the root Nodics contract: `../../AGENTS.md`.
- Follow the `gAi` contract: `../AGENTS.md`.
- Follow global guidance: `../../gSetup/llm/README.md`.

## Capability Boundary

- AI Assistant owns conversations, normalized client streaming, governed tool
  planning, conversation usage, and audit contracts.
- Target modules remain the authority for business validation, authorization,
  persistence, and execution. Workflow remains the authority for durable
  multi-step work.
- Knowledge owns reusable ingestion, retrieval, evidence, and citations.
  Assistant may consume Knowledge but must not duplicate its indexes or source
  lifecycle.
- AI Assistant calls only the `aiProviders` gateway. It must not select, import,
  configure, or invoke an individual vendor provider.
- Never place provider credentials, provider adapters, browser behavior, Axis components, or
  project-specific prompts in this reusable backend module.
- Configuration may customize behavior but may not weaken tenant isolation,
  target authorization, confirmation, audit, or secret boundaries.
- Provider execution requires a persisted single-owner turn lease. nCache may
  accelerate lease visibility but must not replace persisted turn authority.
- Recovery must not replay a provider call when its durable execution phase
  makes the provider outcome uncertain.
- Operational metrics must remain fixed-cardinality and must not label tenant,
  employee, conversation, turn, prompt, model, provider, or user content.
- Maintenance schedules belong to CronJob and must be inactive core data by
  default. Never create an Assistant-owned timer or startup import side effect.
- Persist authenticated cancellation intent before local abort delivery.
  Completion and cancellation must race through the persisted owner/state
  boundary; never rely on a process-local execution map as authority.
- Tool policy approves only stable tool, owner-module, and operation identities.
  Resolve method, path, and permissions again from the current employee-filtered
  BackOffice OpenAPI observation immediately before every execution. Never
  accept model- or browser-supplied URLs, methods, credentials, or target
  authorization results.
- Read-only tool calls must forward the authenticated employee bearer context
  through `DefaultModuleService`; an internal module token must never replace
  the human identity for an employee-requested business operation.
- A tool policy must explicitly allowlist the top-level result fields that may
  enter provider context. Response size bounds alone are not a disclosure
  policy, and full target responses must never be exposed by default.
- Every adapter and extension point requires conformance, override, negative,
  boundary, security, and failure tests.
- Mutations use the persisted confirmation boundary. Bind approval to tenant,
  employee, stable operation identity, immutable argument digest, expiry,
  revision, and idempotency. Claim execution atomically before dispatch and
  never automatically replay an uncertain outcome.
- Provider mutation output is a non-executable proposal. Resolve its stable
  tool, owner-module, and operation identities against the active policy and
  current employee-filtered BackOffice contract before creating confirmation.
  Missing required fields produce structured clarification and must not create
  a confirmation. Never accept model-supplied URLs, methods, permissions,
  credentials, unknown arguments, confirmation state, or execution claims.
- Profile remains enterprise authority. Multi-step or manual confirmed work
  creates one Workflow carrier; Assistant retains only its reference and never
  duplicates Workflow state.
- Assistant presentation records belong to BackOffice-owned Axis CMS core
  data. Backend modules contribute non-executable renderer keys; React
  renderers remain in the separate Axis repository.
- Conversation history must restore client-safe structured interaction state,
  not only message text. It may expose clarification, stable tool lifecycle,
  confirmation lifecycle, citations, normalized usage, and reconciliation
  state, but never mutation arguments, raw tool results, provider details,
  reservation identifiers, credentials, or target URLs.
- Confirmation retrieval, approval, rejection, expiry, and execution remain
  employee-owned persisted lifecycle operations. Reject only unchanged pending
  or approved records; expired, consumed, rejected, executing, and uncertain
  records must not be replayed or reopened.
