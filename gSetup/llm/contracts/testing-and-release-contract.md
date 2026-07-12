# Testing And Release Contract

Use proportionate validation while preserving enterprise reliability.

For active development:

- Run focused tests for the module or behavior changed.
- Run syntax or contract checks when touching shared runtime paths.
- Regenerate and validate LLM context when changing module structure,
  documentation, or AI guidance.

Before commit or release:

- Run the relevant module test suite.
- Run `npm run ai:validate`.
- Run `npm run llm:validate`.
- Run `npm run quality:docs`.
- Run broader/full checks when shared runtime behavior, security, persistence,
  cache, auth, schema, router, or generated artifacts are affected.

Full validation should happen at commit/release gates or periodic checkpoints,
not after every tiny edit, so Nodics remains practical for AI-assisted
development without sacrificing quality.
