# Anthropic Provider Agent Contract

- Follow `../../../AGENTS.md`, `../../AGENTS.md`, `../AGENTS.md`, and repository guidance.
- Own only Anthropic protocol/SDK translation and safe capability registration.
- Register through `aiProviders`; never expose an Anthropic service directly to
  Assistant, Knowledge, Axis, or a business module.
- Remain disabled until explicitly activated and configured with a backend
  secret reference.
- Do not own provider selection, fallback, quotas, conversations, retrieval,
  tools, Workflow, target authorization, or business behavior.
- Implement provider-specific token estimation and normalize actual usage;
  never invoke the provider outside the parent reservation/reconciliation gate.
