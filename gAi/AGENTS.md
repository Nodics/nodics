# gAi Agent Contract

## Inheritance

- Follow the root Nodics contract: `../AGENTS.md`.
- Follow global guidance: `../gSetup/llm/README.md`.
- Follow the nearest child-module `AGENTS.md`.

## Group Boundary

- `gAi` is the optional cross-cutting backend group for AI orchestration,
  knowledge retrieval, and provider abstraction.
- AI modules are not automatically part of `gFramework`, `gCore`, or `gExp`
  runtime composition. A server activates this group and the required modules
  explicitly.
- `aiAssistant` and `aiKnowledge` call only `aiProviders`; they never import,
  select, configure, or invoke a vendor adapter.
- `aiProviders` is the sole Nodics AI-provider gateway and selection authority.
  Vendor modules implement adapters and register capabilities with that gateway.
- Target modules, Workflow, nSearch, Profile, BackOffice, and source modules
  retain their existing business, process, search, identity, discovery, and
  source authority.
- Configuration chooses among active, registered providers but cannot activate
  missing code or weaken security, tenant, permission, audit, or secret rules.
- Every provider call must pass fail-closed token estimation, immutable budget
  planning, atomic reservation, actual-usage reconciliation, exact-decimal cost
  accounting, and release on failure before it is considered valid.
- AI Assistant owns semantic history/tool-result optimization; AI Knowledge
  owns evidence/embedding optimization; aiProviders owns the only token/cost
  ledger boundary. Never count or charge the same usage in multiple modules.
- Optimization must never remove security instructions, authorization context,
  confirmation requirements, required tool schemas, citations, source identity,
  tenant/classification controls, or audit correlation.
