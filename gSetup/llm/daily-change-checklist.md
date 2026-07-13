# Daily Change Checklist

Read this compact checklist for every coherent code-change slice. Do not repeat
the full Nodics architecture contract in prompts or status messages.

First classify the working mode. In framework-maintainer mode, validate the
affected Nodics framework boundary. In application-developer mode, treat the
released Nodics framework as immutable and already qualified: inspect, edit,
generate, and test only project-owned modules and effective project behavior.
Do not audit or rerun checks across Nodics framework source unless the developer
explicitly requests framework inspection. If mode is unstated, derive it from
the owner of the requested change and use the smallest project-owned scope.

Before editing, answer briefly:

1. **Owner:** Which capability, module, and layer own the change?
2. **Reuse:** Which existing loader, registry, generator, service, pipeline, or governance path handles it?
3. **Override:** How can a later project/environment/server/node module customize it without editing core?
4. **Impact:** Which layers are mandatory, conditional, generated, runtime-merged, or unaffected?
5. **Proof:** Which focused behavior and override/customization tests will prove it?

For non-trivial changes, also classify the artifact owner before coding:
metadata, properties, status definitions, schema, router, controller, facade,
service, pipeline, handler, interceptor, generated artifact, test, or
documentation. Use `contracts/nodics-expert-decision-contract.md` when the
correct layer is unclear.

Stop and redesign if ownership is unclear, a parallel mechanism is being added,
or the customization path cannot be explained.

During implementation:

- change only affected layers
- preserve tenant, security, validation, audit, diagnostics, and compatibility contracts
- keep generated output derived from source
- keep code understandable, diagnosable, safely changeable, and reviewable by a
  developer who did not create it
- update affected `AGENTS.md`, `README.md`, `docs/`, `llm/contracts/`,
  `llm/examples/`, generated LLM context, and tests when behavior or extension
  guidance changes
- run focused tests after changing the relevant behavior

Load detailed guidance only when relevant:

- properties, schemas, routers, services, or generated functionality:
  `artifact-definition-and-change-guide.md`
- test selection: `testing-playbook.md`
- significant architecture/security/runtime work:
  `prompts/enterprise-architecture-quality-prompt.md`
- maintainability or layer-selection uncertainty:
  `contracts/human-maintainability-contract.md` and
  `contracts/nodics-expert-decision-contract.md`
- commit, merge/release, or periodic audit: `change-gate-contract.md`

Evidence may be reused while the relevant files remain unchanged. Do not rerun
or restate unchanged analysis merely to satisfy ceremony.
