# Nodics AI Agent Contract

This is the canonical AI-agent contract for Nodics. Tool-specific files such as
`CLAUDE.md`, `CONVENTIONS.md`, `.github/copilot-instructions.md`, and
`.cursor/rules/nodics-core.mdc` must point here instead of duplicating rules.

## Platform Principle

Nodics is an enterprise application platform and application factory.

Core rule: capabilities are sacred, implementations are negotiable.

Framework modules provide default capabilities. Project, environment, server,
node, tenant, and customer modules may override implementations through the
layered module hierarchy without modifying out-of-the-box Nodics code.

## Required Expert Posture

AI tools and human technical leaders working on Nodics must use an
enterprise-grade architecture and quality lens, not a narrow code-editing lens.
For significant design, implementation, refactor, security, testing,
documentation, generated-artifact, or runtime-governance work, apply
`gSetup/llm/prompts/enterprise-architecture-quality-prompt.md`.

The expected posture is:

- act as an enterprise architect, solution architect, software architect,
  principal engineer, quality engineering leader, AI expert, AI-tool expert,
  and Nodics framework expert;
- define module boundaries, ownership, dependencies, coupling risks,
  customization paths, scalability paths, deployment impact, security impact,
  observability impact, and testing strategy before recommending architecture;
- review code for architecture quality, design pattern fit, security,
  performance, maintainability, runtime governance, generated artifact impact,
  extension/override behavior, and test coverage;
- analyze requirements for affected modules, APIs, schemas, database behavior,
  tenant behavior, permissions, integration contracts, implementation approach,
  and automated test strategy;
- challenge assumptions and explain trade-offs instead of providing generic
  advice;
- design for enterprise systems that may serve many tenants, environments,
  deployment topologies, teams, integrations, and high-volume users.

## Mandatory Rules

- Before changing code, identify the active module boundary and nearest
  `AGENTS.md`.
- Do not hardcode project-specific behavior into reusable framework behavior.
- Behavior must come from active modules, layered configuration, tenant context,
  schema definitions, routers, services, pipelines, data, and runtime governance.
- Security, access, routing, cache, audit, validation, and governance values
  that a project may reasonably change must be configurable through layered
  `properties.js` or runtime governance. Do not hardcode such values in source
  code when a property-backed resolver can preserve the capability contract.
- Generated artifacts must be regenerated from source definitions; do not treat
  generated files as hand-maintained source of truth.
- Security, access control, validation, audit, rollback, diagnostics, and tests
  are platform contracts, not optional enhancements.
- Tests must be layer-aware and contract-aware. Framework tests protect
  platform invariants and default module contracts; project, environment,
  server, node, tenant, or customer tests must reuse Nodics test engines while
  generating fixtures and assertions from the effective active contract after
  overrides.
- Preserve multi-tenancy, modular deployment, runtime configurability,
  traceability, and layered overrideability.
- Apply compatibility as a governed release concern, not a blanket pre-production
  constraint. Until Nodics has a production-ready reference project/release,
  prefer clean best-principle implementations over compatibility shims unless
  the owner explicitly asks for a compatibility path.
- When working in a customer/project module that uses Nodics, do not inspect or
  modify framework code unless the developer explicitly asks for framework work.

## Customer/Project Module Mode

When the active task is inside a customer/project module, framework code is an
immutable dependency by default. Customize through the project hierarchy unless
the developer explicitly asks for Nodics framework changes.

## Standard Module Shape

Every module-shaped package should use this structure where applicable:

```text
module/
  AGENTS.md
  README.md
  package.json
  config/
  docs/
  llm/
    README.md
    contracts/
    examples/
    generated/
  src/
  test/
```

Aggregator modules and submodules follow the same convention. For example,
`gFramework/nCache`, `gFramework/nCache/cache`, and
`gFramework/nCache/redisCache` each own their own `AGENTS.md`, `README.md`,
`docs/`, and `llm/` guidance.

## Documentation Impact Contract

Every functional change must evaluate whether these artifacts need updates:

- `AGENTS.md` when AI/developer rules, extension boundaries, validation
  expectations, or module-specific contribution behavior changes.
- `README.md` when module purpose, capabilities, setup, usage, extension
  points, or public behavior changes.
- `docs/` when architecture, runtime contracts, security model, configuration
  model, lifecycle, troubleshooting, or operational behavior changes.
- `llm/` when AI guidance, generated module context, examples, checklists, or
  module summaries become stale.
- `llm/contracts/` when a behavior rule, extension boundary, override contract,
  security expectation, validation rule, testing obligation, or generated
  artifact responsibility changes.
- `llm/examples/` when a change introduces or alters the recommended way to
  customize, extend, configure, test, or consume module behavior.
- `test/` when behavior changes or a new contract is introduced.
- `config/`, schema, router, service, pipeline, and data definitions when
  defaults, override points, or runtime governance change.

AI-assisted changes must update AI-facing guidance with the same care as source
code because future developers and AI tools will depend on it. A change is not
complete until behavior, tests, human documentation, and AI guidance are
consistent.

## Validation Discipline

- Run focused tests for the changed module first.
- Run generated-context validation when changing module structure, docs, or LLM
  guidance.
- Run full or release-grade checks at commit/release boundaries, not after every
  tiny edit, to protect development cost and token usage.
- Prefer Nodics-native extension points over shortcuts. If a developer suggests
  a shortcut that weakens hierarchy or customization, explain the safer Nodics
  alternative.

## Canonical Guidance

- Global AI guidance: `gSetup/llm/README.md`
- Module standard: `gSetup/llm/standards/module-standard.md`
- AI contracts: `gSetup/llm/contracts/`
- Change process: `gSetup/llm/feature-process.md`
