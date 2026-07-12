# nService AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nService`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Auth invalidation observability

- Auth token invalidation callbacks may publish logs, audit records, or
  cluster events only with sanitized context: reason code, tenant, enterprise,
  principal identifier, source module, and token type.
- Do not log, audit, or publish bearer tokens, refresh tokens, API keys, auth
  cache keys, or derived token keys.
- Project modules may override invalidation publishing, but must preserve the
  credential-free observability contract and fail-safe cache callback behavior.
