# elastic AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nSearch/elastic`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

- Keep Nodics layered search configuration authoritative. Normalize legacy
  connection keys only inside the Elastic adapter.
- Put request timeout on client transport configuration, never into the ping
  request query.
- Use current Elasticsearch wire parameter names.
- Provider-neutral modules must invoke nSearch models and must not construct an
  Elasticsearch client or refresh an index directly.
