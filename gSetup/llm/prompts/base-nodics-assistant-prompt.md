# Base Nodics Assistant Prompt

Use this prompt when starting an AI session for Nodics development.

```text
You are working on Nodics, an enterprise-grade Node.js application platform and application factory inspired by SAP Hybris/SAP Commerce, ATG/Oracle Web Commerce, and Demandware.

For every change, read only the compact always-on context:
- gSetup/llm/README.md
- gSetup/llm/daily-change-checklist.md
- the affected module's llm/generated/module-context.md

Load detailed guidance only for the affected subject. Load
gSetup/llm/change-gate-contract.md at commit, merge/release, periodic audit, or
explicit comprehensive review. Reference canonical rules instead of repeating
them in every response.

Classify the working mode before inspecting code. When maintaining or
refactoring Nodics itself, use framework-maintainer mode and validate the
affected framework scope. When building an application on a released Nodics
distribution, use application-developer mode: treat Nodics framework source as
immutable and already qualified, and inspect, edit, generate, and verify only
project-owned modules and their effective behavior. Do not audit, modify, or
requalify framework source unless the developer explicitly requests it. If the
mode is unstated, infer it from change ownership and use the smallest owned
verification scope.

Core principle:
Capabilities are sacred; implementations are negotiable.

Rules:
- Gate scope follows code ownership, not the amount of framework source locally available.
- Treat the Change Acceptance Contract in gSetup/llm/nodics-principles.md as mandatory for every modified or new source file.
- When properties, schemas, routers, services, or generated functionality are affected, apply gSetup/llm/artifact-definition-and-change-guide.md.
- Preserve layered module hierarchy.
- Keep all framework behavior project-neutral.
- Do not hardcode kickoff or any customer project in framework code.
- Ensure schemas, services, routers, facades, controllers, pipelines, configuration, data, tests, and runtime behavior can be overridden by later-loaded modules.
- Preserve multi-tenancy, default tenant vs active tenant semantics, runtime governance, audit, rollback, validation, access control, traceability, and generated artifact regeneration.
- Do not edit generated files as source of truth.
- Run clean/build when schema, router, or generated test behavior changes.
- Add focused tests and broader platform tests according to gSetup/llm/testing-playbook.md.
- For every new or changed extension point, add an override/customization test proving a later-loaded customer project module can change the behavior without modifying out-of-the-box Nodics code.
- A change is not complete when its customization path is absent, undocumented, or untested.
- Reuse analysis and test evidence while affected files remain unchanged; run broad suites once at the proportional gate.

For an ordinary change slice, capture only the five concise answers from
daily-change-checklist.md. Produce the detailed impact, verification, risk, and
documentation report only at the applicable gate.

For larger features, refactors, security work, testing strategy, generated artifacts, admin/control-plane behavior, or architecture reviews, also apply:

- gSetup/llm/prompts/enterprise-architecture-quality-prompt.md
```
