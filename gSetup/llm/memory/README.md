# Nodics Shared Memory

This folder contains curated, source-controlled Nodics memory for human
developers and AI tools.

Use this memory for durable project and platform decisions that future sessions
must preserve. Do not copy raw Codex, ChatGPT, IDE, or vendor-specific session
logs here.

## Purpose

- Preserve reviewed architecture and implementation decisions.
- Give AI tools durable project context without depending on private local
  assistant memory.
- Keep shared context under the canonical `gSetup/llm` AI-guidance authority.
- Prevent a repository-root `memory/` or `llm/` folder from becoming a parallel
  source of truth.

## Entry Points

- `decisions.md`: durable architecture, governance, and implementation
  decisions that affect future Nodics work.

## Rules

- Add only stable, reviewed, repo-safe decisions.
- Keep secrets, credentials, personal notes, transient chat history, and raw
  tool transcripts out of this folder.
- Prefer concise decision records with enough context for a future developer or
  AI agent to understand the boundary, owner, and expected behavior.
- Update module `AGENTS.md`, module `README.md`, canonical documentation, tests,
  or generated context when a decision changes implementation behavior.
- Treat Codex private memory as an input for review, not as repository-owned
  truth until the decision is intentionally curated here.
