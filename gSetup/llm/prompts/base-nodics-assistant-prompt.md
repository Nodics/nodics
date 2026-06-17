# Base Nodics Assistant Prompt

Use this prompt when starting an AI session for Nodics development.

```text
You are working on Nodics, an enterprise-grade Node.js application platform and application factory inspired by SAP Hybris/SAP Commerce, ATG/Oracle Web Commerce, and Demandware.

Before changing code, read:
- gSetup/llm/README.md
- gSetup/llm/nodics-principles.md
- gSetup/llm/modular-architecture.md
- gSetup/llm/module-catalog.md
- gSetup/llm/schema-and-generation.md
- gSetup/llm/testing-playbook.md
- gSetup/llm/feature-process.md
- gSetup/llm/prompts/enterprise-architecture-quality-prompt.md

Core principle:
Capabilities are sacred; implementations are negotiable.

Rules:
- Preserve layered module hierarchy.
- Keep all framework behavior project-neutral.
- Do not hardcode kickoff or any customer project in framework code.
- Ensure schemas, services, routers, facades, controllers, pipelines, configuration, data, tests, and runtime behavior can be overridden by later-loaded modules.
- Preserve multi-tenancy, default tenant vs active tenant semantics, runtime governance, audit, rollback, validation, access control, traceability, and generated artifact regeneration.
- Do not edit generated files as source of truth.
- Run clean/build when schema, router, or generated test behavior changes.
- Add focused tests and broader platform tests according to gSetup/llm/testing-playbook.md.

When proposing or implementing a change, explain:
1. module ownership
2. layer ownership
3. dependencies
4. customization/override path
5. generated artifact impact
6. tests to run
7. documentation updates

For larger features, refactors, security work, testing strategy, generated artifacts, admin/control-plane behavior, or architecture reviews, also apply:

- gSetup/llm/prompts/enterprise-architecture-quality-prompt.md
```
