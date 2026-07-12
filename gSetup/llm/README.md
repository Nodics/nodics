# Nodics LLM Enablement Pack

This folder is the source-controlled context pack for AI-assisted Nodics development. It is intentionally tool-neutral: hosted models, local models, coding agents, IDE assistants, and future automation tools should be able to read these files and work with Nodics safely.

Use this pack before making architectural recommendations, code changes, tests, generated artifacts, or documentation.

## How To Use

Start every AI-assisted Nodics session with:

```text
Read AGENTS.md, the nearest module-level AGENTS.md, gSetup/llm/README.md, and gSetup/llm/daily-change-checklist.md first. Load linked detailed guidance only for the affected artifact or active change gate.
```

## Token-Efficient Reading Contract

Do not load the complete enablement pack for every small edit. Use progressive
disclosure so AI-assisted development remains affordable without weakening the
Nodics contract.

Always read:

1. root `AGENTS.md`
2. nearest module-level `AGENTS.md`
3. `gSetup/llm/README.md`
4. `daily-change-checklist.md`
5. the affected module's `llm/generated/module-context.md`

Before reading module context or running verification, identify the working
mode:

- **Framework-maintainer mode:** the requested change owns or intentionally
  refactors Nodics framework code. Framework source and proportional framework
  gates are in scope.
- **Application-developer mode:** the developer is building an application on
  a released Nodics distribution. Treat Nodics framework source as an immutable,
  previously qualified dependency. Read, edit, generate, and verify only the
  project-owned modules and their effective configuration by default. Do not
  scan, audit, modify, regenerate, or rerun framework-wide quality gates merely
  to re-prove Nodics principles.

Application-developer mode may inspect or modify Nodics framework source only
when the developer explicitly requests it. If the working mode is not stated,
infer it from ownership of the requested change and keep the verification scope
to the smallest owned boundary. This scope rule is mandatory for token and
execution efficiency; it does not weaken validation of project code.

Load detailed files only when their subject is affected:

1. `contracts/nodics-principles.md`
2. `contracts/module-structure-contract.md`
3. `contracts/documentation-impact-contract.md`
4. `contracts/testing-and-release-contract.md`
5. `contracts/customer-project-mode-contract.md`
6. `nodics-principles.md`
7. `modular-architecture.md`
8. `module-catalog.md`
9. `artifact-definition-and-change-guide.md`
10. `schema-and-generation.md`
11. `testing-playbook.md`
12. `standards/module-standard.md`
13. `standards/code-documentation-standard.md`
14. `feature-process.md`
15. `prompts/base-nodics-assistant-prompt.md`
16. `prompts/enterprise-architecture-quality-prompt.md`

Load `change-gate-contract.md` only at commit, merge/release, periodic-audit, or
explicit comprehensive-review time. Canonical rules should be referenced rather
than repeated in every prompt or progress update.

## Core Rule

Nodics is an enterprise application platform and application factory, not a lightweight Node.js API framework.

Capabilities are sacred; implementations are negotiable.

Every feature must preserve layered customization, multi-tenancy, runtime governance, generated artifact regeneration, traceability, and backward compatibility.

The `Change Acceptance Contract` in `nodics-principles.md` is mandatory for
every modified or new source file. In particular, a new or changed extension
point is incomplete until its later-loaded override path is documented and an
override/customization test proves that customer code can change the behavior
without modifying out-of-the-box Nodics code.

## What This Pack Covers

- General Nodics framework intent.
- Module-level responsibilities.
- Module-owned LLM context conventions and generated module intelligence.
- Modular and layered architecture concepts.
- Schema-driven model, service, API, and test generation.
- Clean/build/generated artifact rules.
- Test framework expectations.
- Required process for adding new functionality.
- Artifact-specific definition, layering, lifecycle, and change-impact rules.
- Token-efficient daily, commit, merge/release, and periodic audit gates.
- AI prompts, enterprise review expectations, and decision memory for future sessions.
- Portable AI-agent contracts, tool bridge files, and `npm run ai:validate`
  governance checks.

## Important Boundaries

- In application-developer mode, treat released Nodics code as immutable and
  already qualified. Apply these contracts to project-owned code and overrides,
  not to a new repository-wide framework audit, unless explicitly requested.
- Do not hardcode project names such as `kickoff` in framework behavior.
- Do not place generated files under `gSetup/llm`.
- Keep source-derived module LLM files under each module's `llm/generated` folder.
- Do not make AI guidance specific to one AI vendor.
- Do not require vendor-specific commands, hidden instruction files, response formats, or proprietary agent features for the standard Nodics workflow.
- Keep instructions in portable Markdown and source-derived JSON. Vendor adapters may reference this pack, but must not become its source of truth.
- Do not bypass Nodics loaders, schema generation, service/facade/controller/router layers, tenant context, or runtime governance.
- Do not hardcode security, access, routing, cache, audit, validation, or
  governance values that projects may need to change. Define defaults in
  layered `properties.js` or runtime governance and reference them from source
  through a resolver such as router `permissionConfig`.
- Do not remove existing capabilities just because they are complex.
- Do not provide generic architecture or testing advice without mapping it to Nodics modules, layers, tenants, generated artifacts, runtime governance, and override paths.

## Context Quality Contract

Context existence is not the same as context quality. A useful module context must identify ownership, runtime responsibility, dependencies, extension points, generated artifacts, configuration, tests, and known documentation gaps.

Generated context reports source-derived facts and must never invent undocumented business intent. Each module's `generated/module-context.md` contains a file inventory that marks source documentation as `documented`, `partially-documented`, or `undocumented`; non-JavaScript files are `inventory-only`. The source fingerprint in `manifest.json` lets validation detect stale context after any owned file changes.

Documentation completion is incremental and governed. Do not mark a module complete merely because its `llm` folder exists. Add an enforced documentation gate only after its file and method contracts have been reviewed for accuracy.
