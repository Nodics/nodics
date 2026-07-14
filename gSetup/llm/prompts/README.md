# Nodics Workflow Prompts

Use these prompts with `base-nodics-assistant-prompt.md`. Add
`enterprise-architecture-quality-prompt.md` for large, risky, architectural,
security, generated-artifact, or runtime-governance work.

These prompts are workflow lenses, not separate rule sources. Canonical
contracts stay in `gSetup/llm/contracts`, `gSetup/llm/nodics-principles.md`,
and the affected module's source-owned guidance.

## Available Prompts

- `review-prompt.md`: review a Nodics change for bugs, regressions, missing
  tests, ownership mistakes, and framework-contract violations.
- `refactor-prompt.md`: refactor safely without removing capabilities,
  duplicating loaders, or bypassing override paths.
- `testing-prompt.md`: design or extend tests across focused, generated,
  module, topology, and release gates.
- `schema-change-prompt.md`: change schemas and generated artifacts through the
  schema hierarchy and build lifecycle.
- `runtime-governance-prompt.md`: change runtime-governed behavior through
  preview, approval, activation, audit, rollback, diagnostics, and policy.
