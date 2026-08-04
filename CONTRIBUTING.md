<!--
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
-->

# Contributing to Nodics

Nodics contributions must preserve the framework principle: configuration-first, modular, layered, test-backed, and customizable without editing released framework code for customer-specific behavior.

## Before changing code

1. Read root `README.md` for orientation and documentation routes.
2. Read root `AGENTS.md` for mandatory AI/developer working rules.
3. Read the full root-to-leaf guidance chain: every applicable ancestor
   `README.md` and `AGENTS.md` from root to the owning module.
4. Read the nearest module `README.md`, nearest module `AGENTS.md`, and relevant
   module `llm/contracts`, `llm/examples`, and `llm/generated` context.
5. Read relevant `gSetup/llm/contracts` and available online/offline
   `nodicsdocs` material for the framework area being changed.
6. Confirm the owning module. Do not add parallel services, routes, schemas,
   renderers, config paths, providers, loaders, registries, workflows, or
   generated artifacts for behavior already owned by another module.
7. Decide whether the change belongs in framework, project, environment,
   server, node, tenant, provider, data configuration, or runtime governance.
8. Record pre-implementation readiness for non-trivial changes: business
   outcome, owner, studied sources, current behavior, extension path,
   security/tenant/data/UX/API/release impact, assumptions, intended files, and
   validation route.

README files explain module purpose, usage, and extension paths. AGENTS files
govern how contributors and AI tools may change that scope. LLM contracts
specify exact rules, examples demonstrate approved patterns, and generated
context reports source-derived facts.

## Implementation rules

- Keep root `package.json` as the only npm dependency authority.
- Keep module `package.json` files metadata-only.
- Keep `properties.js` files configuration-only; move behavior to services, utils, adapters, or providers.
- Preserve generated artifact workflows. Do not manually edit generated output as source.
- Add tests with the implementation, including override/customization tests when an extension point is changed.
- Update canonical documentation when user-facing or extension-facing behavior changes.
- Treat class-level and function-level comments/JSDoc as part of the current
  framework study surface, but reconcile stale comments against source,
  contracts, tests, and runtime behavior.
- AI tools must act as Nodics framework experts plus enterprise architecture,
  business analysis, security/compliance/tenant governance, QA, UX, data,
  AI/tooling, and release/operations experts. The visible depth may be
  proportional, but these responsibilities do not disappear.
- Planning, review, and discovery requests do not authorize implementation,
  deployment, publishing, destructive changes, external communication, or
  residual-risk acceptance.

## Required validation

For source or test changes involving generated context, run:

```sh
npm run llm:generate
npm run llm:validate
```

For release-quality changes, run the governed release gate:

```sh
npm run release:check -- --execute
```
