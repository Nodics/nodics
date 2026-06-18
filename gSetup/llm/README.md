# Nodics LLM Enablement Pack

This folder is the source-controlled context pack for AI-assisted Nodics development. It is intentionally tool-neutral: hosted models, local models, coding agents, IDE assistants, and future automation tools should be able to read these files and work with Nodics safely.

Use this pack before making architectural recommendations, code changes, tests, generated artifacts, or documentation.

## How To Use

Start every AI-assisted Nodics session with:

```text
Read gSetup/llm/README.md first, then follow the linked Nodics architecture, layering, schema, generation, testing, and feature-process rules before changing code.
```

Recommended reading order:

1. `nodics-principles.md`
2. `modular-architecture.md`
3. `module-catalog.md`
4. `schema-and-generation.md`
5. `testing-playbook.md`
6. `feature-process.md`
7. `prompts/base-nodics-assistant-prompt.md`
8. `prompts/enterprise-architecture-quality-prompt.md`

## Core Rule

Nodics is an enterprise application platform and application factory, not a lightweight Node.js API framework.

Capabilities are sacred; implementations are negotiable.

Every feature must preserve layered customization, multi-tenancy, runtime governance, generated artifact regeneration, traceability, and backward compatibility.

## What This Pack Covers

- General Nodics framework intent.
- Module-level responsibilities.
- Module-owned LLM context conventions and generated module intelligence.
- Modular and layered architecture concepts.
- Schema-driven model, service, API, and test generation.
- Clean/build/generated artifact rules.
- Test framework expectations.
- Required process for adding new functionality.
- AI prompts, enterprise review expectations, and decision memory for future sessions.

## Important Boundaries

- Do not hardcode project names such as `kickoff` in framework behavior.
- Do not place generated files under `gSetup/llm`.
- Keep source-derived module LLM files under each module's `llm/generated` folder.
- Do not make AI guidance specific to one AI vendor.
- Do not require vendor-specific commands, hidden instruction files, response formats, or proprietary agent features for the standard Nodics workflow.
- Keep instructions in portable Markdown and source-derived JSON. Vendor adapters may reference this pack, but must not become its source of truth.
- Do not bypass Nodics loaders, schema generation, service/facade/controller/router layers, tenant context, or runtime governance.
- Do not remove existing capabilities just because they are complex.
- Do not provide generic architecture or testing advice without mapping it to Nodics modules, layers, tenants, generated artifacts, runtime governance, and override paths.

## Context Quality Contract

Context existence is not the same as context quality. A useful module context must identify ownership, runtime responsibility, dependencies, extension points, generated artifacts, configuration, tests, and known documentation gaps.

Generated context reports source-derived facts and must never invent undocumented business intent. Each module's `generated/module-context.md` contains a file inventory that marks source documentation as `documented`, `partially-documented`, or `undocumented`; non-JavaScript files are `inventory-only`. The source fingerprint in `manifest.json` lets validation detect stale context after any owned file changes.

Documentation completion is incremental and governed. Do not mark a module complete merely because its `llm` folder exists. Add an enforced documentation gate only after its file and method contracts have been reviewed for accuracy.
