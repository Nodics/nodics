# OpenAI Provider Agent Contract

- Follow the root Nodics contract: `../../../AGENTS.md`.
- Follow the `gAi` contract: `../../AGENTS.md`.
- Follow the AI Providers contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../../../gSetup/llm/ai-enablement-index.md`.
- Own only OpenAI protocol/SDK translation and safe capability registration.
- Register through `aiProviders`; never expose an OpenAI service directly to
  Assistant, Knowledge, Axis, or a business module.
- Remain disabled until explicitly activated and configured with a backend
  secret reference.
- Do not own provider selection, fallback, quotas, conversations, retrieval,
  tools, Workflow, target authorization, or business behavior.
- Implement provider-specific token estimation and normalize actual usage;
  never invoke the provider outside the parent reservation/reconciliation gate.
