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

Configuration layers must contribute only what they own or intentionally
change. Capability and provider modules own reusable defaults; project modules
own reusable application policy; environments own genuine deployment-wide
differences; servers own process composition, topology, and intentional
process-level selections; nodes own instance identity and instance-specific
overrides. Never restate an inherited default as a placeholder in a later
`properties.js`, and never copy complete capability/provider policy blocks into
environment, server, or node configuration.

## Required Expert Posture

AI tools and human technical leaders working on Nodics must use an
enterprise-grade architecture and quality lens, not a narrow code-editing lens.
For significant design, implementation, refactor, security, testing,
documentation, generated-artifact, or runtime-governance work, apply
`gSetup/llm/prompts/enterprise-architecture-quality-prompt.md`.

The expected posture is mandatory, not prompt flavor. An AI tool working on
Nodics must act as a Nodics delivery expert council before it acts as a code
editor. It must bring the combined lenses of Nodics framework expert,
enterprise architect, solution architect, business analyst, principal engineer,
security/privacy/compliance and tenant-governance SME, quality engineering
leader, customer-aware UX thinker, data architecture/governance expert,
AI/tooling governance expert, release/operations expert, and framework
maintainer.

The expected posture is:

- act as an enterprise architect, solution architect, software architect,
  business analyst, principal engineer, quality engineering leader, security
  governance SME, customer-aware UX expert, data expert, AI expert, AI-tool
  expert, release expert, and Nodics framework expert;
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

AI tools must scale visible ceremony to the task, but they must not drop these
responsibilities from their reasoning. A small local edit can have a compact
pre-action note. A material, cross-module, security, tenant, data, AI/tooling,
customer-facing, or release-impacting change must make the active lenses,
evidence, assumptions, and residual risks explicit.

## Required Reading Order

Start from the repository root, then walk to the owning module. Read these
files in order before implementation:

1. root `README.md` for human orientation and documentation routes;
2. root `AGENTS.md` for mandatory repository-wide behavior;
3. `CONTRIBUTING.md` when the task changes source, tests, generated artifacts,
   or documentation;
4. every applicable ancestor module `README.md` from root toward the target;
5. every applicable ancestor module `AGENTS.md` from root toward the target;
6. the nearest owning module `README.md`;
7. the nearest owning module `AGENTS.md`;
8. the nearest module `llm/contracts`, `llm/examples`, and generated context;
9. relevant global contracts under `gSetup/llm/contracts`;
10. relevant online or offline Nodics documentation from the `nodicsdocs`
    repository when available.

Read `AGENTS.md` files root-to-leaf. Parent instructions establish the global
contract. Child instructions may add local invariants or narrow behavior for
their boundary, but they must not silently contradict parent rules. If
instructions conflict, stop and report the conflict with the files involved.

Archived `AGENTS.md` or `README.md` files under `docs/archive` are historical
material. Do not treat them as active authority unless the task explicitly
edits or reviews that archive.

README files explain purpose, ownership, usage, and extension paths. AGENTS
files govern how contributors and AI tools may change that scope.
Module-local llm README files are not used; module `AGENTS.md` is the AI
navigation and behavior entrypoint. `llm/contracts` specify exact rules,
`llm/examples` demonstrate approved patterns, and generated context reports
source-derived facts.

## Operating Modes And Authority

Before acting, classify the requested mode:

1. **Explain/adopt:** understand and explain implemented capability without
   changing files.
2. **Discover/assess:** inspect current behavior, identify gaps and options,
   but do not implement unless authorized.
3. **Plan/design:** establish outcomes, ownership, requirements, options,
   risks, acceptance, and sequencing; plans remain non-runtime until
   implemented.
4. **Implement:** change only the authorized scope after readiness is
   sufficient.
5. **Review/assure:** evaluate implementation, tests, security, compatibility,
   operations, and documentation; do not silently repair unless requested.
6. **Operate/monitor:** perform only approved operational actions, preserve
   auditability, and escalate destructive or privileged actions.

Role descriptions never authorize file edits, runtime mutation, data mutation,
publishing, deployment, commits, external communication, or residual-risk
acceptance by themselves.

AI tools may not replace repository authority with private chat memory,
temporary docs, generated context, or personal preference. AI tools may not
self-approve residual business, architecture, security, quality, data, UX,
release, or operational risks that require a human or named owner.

## Pre-Implementation Study Gate

No implementation should start from a narrow file-local view. Before the first
code edit for a real feature, fix, refactor, integration, generated-artifact
change, or framework behavior change, build a depth-proportional context from
Nodics itself.

Study:

- root, ancestor, and nearest module README/AGENTS chains;
- global and module-local LLM contracts, examples, generated context, and
  relevant prompts;
- current source, tests, schemas, routers, services, providers, interceptors,
  pipelines, data files, package metadata, topology, and configuration;
- class-level and function-level comments/JSDoc in the affected capability and
  direct dependencies;
- sibling and related module patterns;
- `nTooling` generators, validators, and scripts that define accepted shape;
- relevant `nodicsdocs` online/offline documentation when available.

Before implementing a non-trivial change, record compact readiness evidence:
business outcome, owning module, studied instruction/documentation sources,
related modules and dependency direction, current implementation,
extension/customization path, security/tenant/data/UX/API/release impact,
assumptions, contradictions, stale documentation risk, intended files, and
validation route.

## Mandatory Rules

- Before changing code, identify the active module boundary and nearest
  `AGENTS.md`.
- Before implementing any capability that involves Nodics Axis or another
  frontend application, complete a repository-boundary analysis. Identify the
  authoritative backend behavior, frontend presentation behavior, shared API
  or schema contract, security boundary, documentation owner, and tests that
  belong in each repository. Nodics owns business rules, validation,
  authorization enforcement, persistence, workflows, pipelines, integration
  execution, secrets, tenant governance, and backend contracts. Frontend
  repositories own rendering, interaction, responsive/accessibility behavior,
  and client-side state. Do not add frontend source, browser-specific behavior,
  or UI component implementations to Nodics. Do not move backend business
  authority into a frontend merely to simplify a user interface.
- Apply the reuse-first implementation order for every new requirement:
  1. reuse an existing Nodics capability or contract when it already satisfies
     the requirement;
  2. customize, extend, compose, or override that implementation through the
     layered module hierarchy when the capability exists but needs different
     behavior;
  3. create a new implementation or capability only after inspecting the
     repository and recording why existing authorities and extension points are
     insufficient.
  Before introducing a new schema, service, loader, registry, pipeline,
  governance layer, cache, workflow, publisher, connector abstraction, or
  runtime authority, run a duplication and parallel-path check. New work must
  integrate with the existing authoritative owner rather than create a second
  source of truth.
- Write and update documentation for guided adoption. A developer with basic
  programming knowledge and an AI coding tool must be able to understand what
  the capability does, where code belongs, how customization works, which
  generated artifacts are affected, and which tests prove the change.
- Design every module for partial discovery. Contributors and AI tools may read
  only root guidance and the nearest module files, so critical ownership,
  dependency, security, persistence, extension, and testing rules must exist in
  the nearest `AGENTS.md`, README, `llm/contracts`, `llm/examples`, generated
  context, and focused tests as applicable. Do not hide a mandatory rule only
  in a distant guide, prompt, temporary plan, or prior conversation.
- Treat the root `package.json` as the only dependency installation authority.
  Module `package.json` files are module metadata only: they identify ownership,
  kind, runtime flags, composition, loader behavior, and governance metadata,
  but must not declare `dependencies` or `devDependencies`. When adding or
  changing an npm package, update root `package.json`, root dependency
  governance ownership metadata, `package-lock.json`, and the relevant tests;
  do not duplicate versions in module manifests.
- Significant capability documentation must include successful, rejected,
  boundary/scale, failure/recovery, and later-layer customization use cases.
  It must address business evaluators, business users, administrators/operators,
  partner developers, framework maintainers, and AI tools, or explicitly state
  why an audience is not applicable.
- Every implemented capability must include detailed, low-level, end-to-end
  documentation for both business users and developers. Business-user guidance
  must explain terminology, prerequisites, roles, configuration choices,
  step-by-step operating workflows, expected results, failure/recovery paths,
  and practical examples without assuming framework or deep technical
  knowledge. Developer guidance must explain authoritative ownership, schemas,
  properties, APIs, services, pipelines, events, extension points, layered OOTB
  customization, security, tenant behavior, observability, deployment,
  migration, troubleshooting, and the exact tests that prove the behavior.
  High-level summaries alone do not satisfy implementation acceptance.
- Every capability that integrates an external provider must document the
  provider-neutral authority, every prebuilt provider and evidence-based
  maturity, selection and layered configuration, how another provider is
  implemented and registered, lifecycle and resilience, applicable
  import/export and cross-capability interactions, operations, security, and
  verification. An irrelevant interaction must be marked not applicable with a
  reason. Deterministic tests alone do not qualify an external provider for
  production; guarded live-provider security, version, topology, capacity,
  failure, recovery, and cleanup evidence is required.
- OOTB customization documentation must show the smallest supported override or
  composition path and must explicitly identify what must not be copied,
  bypassed, or replaced. Examples must preserve existing authorities and avoid
  creating parallel loaders, state machines, registries, schedulers, or runtime
  governance paths.
- Treat this as the documentation thumb rule for every implemented
  functionality: a partner, developer, or AI tool must be able to customize or
  extend the capability through a project-owned later layer without touching
  framework source. Document the exact extension point, smallest working
  example, preserved contract, prohibited bypasses, upgrade/rollback impact,
  and focused tests. Describing only the OOTB behavior is not complete
  documentation.
- Do not hardcode project-specific behavior into reusable framework behavior.
- Every module-shaped package owns its bounded default user-facing label in
  `package.json.nodics.displayName`. Runtime and API identity remains
  `package.json.name`; module hierarchy comes from loader-discovered physical
  parentage. Do not derive labels in clients, duplicate them in central
  configuration, or add manually maintained parent metadata.
- Behavior must come from active modules, layered configuration, tenant context,
  schema definitions, routers, services, pipelines, data, and runtime governance.
- Security, access, routing, cache, audit, validation, and governance values
  that a project may reasonably change must be configurable through layered
  `properties.js` or runtime governance. Do not hardcode such values in source
  code when a property-backed resolver can preserve the capability contract.
- Generated artifacts must be regenerated from source definitions; do not treat
  generated files as hand-maintained source of truth.
- Module `llm/generated` context is generated by tooling, used for local/CI
  validation, and must remain excluded from source control.
- Security, access control, validation, audit, rollback, diagnostics, and tests
  are platform contracts, not optional enhancements.
- Tests must be layer-aware and contract-aware. Framework tests protect
  platform invariants and default module contracts; project, environment,
  server, node, tenant, or customer tests must reuse Nodics test engines while
  generating fixtures and assertions from the effective active contract after
  overrides.
- Preserve multi-tenancy, modular deployment, runtime configurability,
  traceability, and layered overrideability.
- For commercial values, store and compare money and measured quantities as
  validated exact representations; never base price, tax, promotion, stock, or
  order decisions on JavaScript floating-point arithmetic. Keep base Pricing,
  Tax, Promotion, Product, Store, Profile, Units, Inventory, Workflow,
  publishing, and cache ownership separate and compose their contracts through
  configured providers. Versioned Staged business data must reach a distinct
  non-versioned Online runtime only through the existing Workflow and nPublish
  authorities; do not introduce direct-copy or parallel publication paths.
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
`gFramework/nCache/redisCache` each own their own `AGENTS.md`, `README.md`, and
`llm/` guidance. Detailed permanent human documentation belongs in the
canonical documentation content pack, not a parallel module `docs/` tree.

### New Module Acceptance Gate

Creating or materially reshaping a module is never a freehand file-copy task.
Before adding business behavior to a new module-shaped package, agents and
developers must prove the generated/module scaffold first:

1. Read root `README.md`, root `AGENTS.md`, every applicable ancestor
   `AGENTS.md` from root to the target, the nearest module `README.md`, the
   nearest module `AGENTS.md`, and the module generation/structure contracts.
2. Use `npm run generate:*`/`structure:generate` where practical, or manually
   match the generated capability/provider/group/environment/server/node shape
   when an existing compatibility folder is being repaired.
3. Run `npm run structure:audit -- --fail` before adding behavior.
4. Run `npm run module:metadata`; if it rewrites a change, fix the metadata
   normalizer or source rule instead of fighting generated output.
5. Run `npm run llm:generate` and `npm run llm:validate` after source,
   metadata, test, or documentation changes.
6. Add or verify module `README.md`, `AGENTS.md`, `llm/` guidance, focused
   tests, and canonical documentation content before claiming the module is
   ready for developers, partners, or AI tools.

If this gate fails, stop and fix the contract gap before implementing feature
logic. Nodics must guide new developers into the correct module shape; it must
not depend on an expert user noticing missing files after the fact.

## Documentation Impact Contract

Permanent repository documentation must describe implemented, source-backed,
and verified functionality. Future designs, proposed architecture, unresolved
decisions, implementation backlogs, and action plans belong only in the
temporary, untracked, non-runtime root `docs/` workspace until implementation
and validation are complete. Promote only the implemented portions into
canonical `nodicsdocs` content, module `README.md`, and generated context. Do
not link temporary plans from public or module
documentation in a way that presents planned behavior as available capability.

Every functional change must evaluate whether these artifacts need updates:

- canonical `nodicsdocs` capability, solution, tutorial, operations, or
  reference content when the change affects user-observable, configurable,
  operational, security, extension, or business behavior;

- `AGENTS.md` when AI/developer rules, extension boundaries, validation
  expectations, or module-specific contribution behavior changes.
- `README.md` when module purpose, capabilities, setup, usage, extension
  points, or public behavior changes.
- canonical documentation content when architecture, runtime contracts,
  security model, configuration model, lifecycle, troubleshooting, or
  operational behavior changes.
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

When a backend module, frontend application, or reusable project supplies a
CMS documentation content pack, update its granular canonical documentation
source and regenerate committed `data/core` records in the same functional
change. Generated CMS records must never be manually maintained as a shorter
parallel authority. Retirement of README/docs evidence requires a migration
register, detail-preservation validation, deterministic generation checks, and
rendered-content review.

Every module and project retains a concise high-level `README.md` after detailed
guidance migrates into canonical documentation. The README remains the local
entry point for purpose, ownership, implemented capabilities, setup and
verification entry points, supported extension boundaries, and canonical
documentation links. Never remove a module README during documentation
retirement, and never rebuild a second copy of the detailed guides inside it.

AI-assisted changes must update AI-facing guidance with the same care as source
code because future developers and AI tools will depend on it. A change is not
complete until behavior, tests, human documentation, and AI guidance are
consistent.

The platform-wide detail-preservation, audience, migration, and documentation
generation authority is
`gSetup/llm/contracts/documentation-impact-contract.md`. Humans and AI tools
must apply it before creating, restructuring, migrating, reducing, or
generating documentation. A word-count or section-count check is never evidence
that unique verified knowledge was preserved.

Public documentation navigation is capability-first. Do not create a public
page whose identity or primary navigation exists only to mirror a module,
folder, class, or source hierarchy. Module names remain technical ownership and
reference metadata. The `nodicsdocs` repository owns canonical public
documentation content and publishes it through governed content-pack records.
The retired `gDocs` content may remain only as temporary migration evidence
under ignored root `docs/`; it is not a runtime module, public documentation
authority, or source for new guidance. Root `docs/` remains temporary,
untracked, non-runtime material.

For a new end-to-end capability, documentation acceptance must include all
applicable audiences and layers:

- a plain-language business overview and decision guide;
- step-by-step business operating procedures with positive, rejected, failure,
  retry, rollback, and recovery journeys;
- administrator configuration and permission guidance;
- developer architecture, data-contract, API, event, and lifecycle detail;
- OOTB extension examples using Nodics layering and replaceable providers;
- deployment, observability, performance, security, migration, backup/restore,
  and troubleshooting guidance;
- verification commands and expected positive, negative, boundary, contract,
  integration, and regression evidence.

If an audience or layer is not applicable, the owning documentation must say
why rather than silently omit it.

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

- The repository root must not contain a parallel `llm/` directory. Global,
  tool-neutral AI guidance belongs exclusively under `gSetup/llm`; individual
  module-shaped packages retain their own module-local `llm/` context.
- The repository root must not contain a parallel `memory/` directory. Curated,
  repo-owned shared memory belongs under `gSetup/llm/memory`; raw private
  assistant memory and tool transcripts stay outside the repository.
- Global AI guidance: `gSetup/llm/ai-enablement-index.md`
- Shared decision memory: `gSetup/llm/memory/README.md`
- Module standard: `gSetup/llm/standards/module-standard.md`
- AI contracts: `gSetup/llm/contracts/`
- Change process: `gSetup/llm/feature-process.md`
