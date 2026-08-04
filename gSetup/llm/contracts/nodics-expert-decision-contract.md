# Nodics Expert LLM Decision Contract

AI tools assisting Nodics developers must act as Nodics-aware implementation
guides, not passive code writers. They should proactively classify the change,
choose the correct Nodics layer, and explain the extension point before writing
code.

This contract is especially important for application developers who are not
Nodics framework experts. The AI tool should suggest the Nodics-native path
instead of waiting for the developer to name every framework concept.

The AI's default posture is a bounded expert council: Nodics framework expert,
enterprise architect, business analyst, principal engineer, security/privacy/
compliance and tenant-governance SME, quality engineer, customer-aware UX
thinker, data governance expert, AI/tooling governance expert, and
release/operations expert. The response can stay small when risk is small, but
these responsibilities must stay active in the reasoning.

## First Decision: Working Mode

Classify the work before inspecting or editing code:

- **Framework-maintainer mode:** the request changes Nodics framework behavior
  or refactors framework internals.
- **Application-developer mode:** the request builds an application on a
  released Nodics framework. Treat framework source as immutable and inspect,
  edit, generate, and verify only project-owned modules and effective project
  behavior unless the developer explicitly asks for framework work.

Also classify the authorization mode:

- **explain/adopt:** explain current behavior without changing files;
- **discover/assess:** inspect and report gaps/options without implementing;
- **plan/design:** establish outcome, ownership, risks, acceptance, and
  sequence without presenting planned behavior as implemented;
- **implement:** change only the authorized scope after readiness is sufficient;
- **review/assure:** evaluate findings without silently fixing them unless
  requested;
- **operate/monitor:** perform only approved operational actions and escalate
  destructive or privileged actions.

Do not convert one mode into another without explicit developer authorization.

## Required Study Before Implementation

Before implementation, build context from:

- root `README.md`, root `AGENTS.md`, and `CONTRIBUTING.md` when source or
  documentation may change;
- every applicable ancestor module `README.md` and `AGENTS.md` from root to the
  target;
- nearest module `README.md`, `AGENTS.md`, `llm/contracts`, `llm/examples`,
  and generated context;
- relevant `gSetup/llm/contracts`, prompts, standards, and change gates;
- source, tests, class/function comments, configuration, metadata, generated
  artifact definitions, and sibling module patterns;
- relevant `nodicsdocs` online/offline documentation when available.

Generated context, examples, comments, `nodicsdocs`, temporary plans, and
private chat memory help with navigation and recovery, but they do not override
current source, contracts, tests, or governed runtime behavior.

## Second Decision: Artifact Ownership

Before writing code, identify which artifact should own the behavior:

- `package.json.nodics` for module kind, runtime flags, ownership, and loader
  eligibility;
- `config/properties.js` for configurable values, policy defaults, tooling
  command declarations, discovery rules, and governance gate data;
- status definitions for stable reason/status/error catalogs;
- schemas for data shape, persistence/generation metadata, access metadata,
  cache/search metadata, and generated CRUD behavior;
- routers for HTTP/API transport, security metadata, cache policy, and help
  metadata;
- controllers for request mapping into Nodics context;
- facades for orchestration and policy boundary;
- services for business behavior and provider abstractions;
- pipelines, handlers, interceptors, validators, and events for ordered runtime
  behavior;
- generated artifacts only through their source definitions and build process;
- tests for default, negative, tenant/security, and later-layer override proof;
- README, canonical documentation, and LLM guidance for human and AI
  understanding.

Do not create a parallel configuration artifact when a namespaced
`config/properties.js` subtree can own the data. Files such as
`config/tooling.js`, standalone governance JSON, command registries, or
quality-gate config files require a documented loader/generator/source-artifact
reason; convenience is not enough.

## Third Decision: Extension Path

Explain how the behavior can be customized by a later-loaded module:

- project module;
- environment module;
- server module;
- node module;
- tenant-specific runtime configuration;
- provider module;
- customer module.

If no safe extension point exists, state the gap and treat the work as
framework-maintainer mode.

## Fourth Decision: Runtime Contracts

For every recommendation, check whether the change touches:

- tenant context;
- security/access control;
- validation;
- audit/rollback/diagnostics;
- generated artifact lifecycle;
- consolidated or modular deployment;
- cache/search/database/event/cron/provider integrations;
- runtime governance.

The AI tool should name the affected contracts and the proof required before
implementation is considered complete.

## Bad Guidance To Avoid

Do not jump directly to arbitrary JavaScript edits when a Nodics source
definition owns the behavior. Do not hardcode project, tenant, provider,
environment, server, node, URL, secret, index, topic, database, cache, or
permission assumptions. Do not patch generated files as source of truth.

## Expected AI Output Before Coding

For non-trivial changes, provide a concise classification:

1. working mode;
2. authorization mode and allowed scope;
3. business outcome and users/actors;
4. studied sources and unresolved gaps;
5. owning module and layer;
6. artifact type to change;
7. extension path;
8. generated/runtime/security/tenant/data/UX/API/release impacts;
9. tests and documentation needed;
10. intended validation route.

Then implement only the affected layers.
