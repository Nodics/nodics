# gAi

`gAi` is the optional cross-cutting Nodics backend group for AI capabilities.
It is separate from `gFramework`, `gCore`, and `gExp` so a runtime activates AI
only when required.

The implemented group contains:

- `aiAssistant`: conversation, client streaming, governed tools, conversation
  usage, and audit contracts;
- `aiKnowledge`: corpus, ingestion, retrieval evidence, and citation contracts;
- `aiProviders`: the sole provider-neutral gateway used by both capabilities.

No vendor provider is implemented yet. All AI capabilities remain disabled by
default until an environment activates the group, activates the required
modules, configures usage profiles, and supplies registered provider adapters.
