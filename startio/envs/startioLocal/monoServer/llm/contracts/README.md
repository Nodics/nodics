# monoServer AI Contracts

This folder contains module-specific AI/developer contracts for `startio/envs/startioLocal/monoServer`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

Local Assistant acceptance enables only the reviewed BackOffice catalogue read
policy. The server must explicitly activate the vendor adapter selected by its
effective `aiProviders` profile; activating `gAi` alone must not implicitly
activate OpenAI, Anthropic, Gemini, or every future adapter.
