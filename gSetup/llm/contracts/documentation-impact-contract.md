# Documentation Impact Contract

Every functional change must evaluate documentation and AI-guidance impact.

Update the affected artifacts when behavior, extension contracts,
configuration, API shape, schema behavior, router behavior, service behavior,
pipeline behavior, security, cache behavior, build behavior, or generated
artifacts change.

Review:

- `AGENTS.md` for AI/developer rules and extension boundaries.
- `README.md` for module purpose, usage, capabilities, and extension points.
- `docs/` for architecture, runtime contracts, lifecycle, operations, and
  troubleshooting.
- `llm/` for AI guidance, examples, checklists, generated summaries, and module
  context.
- `llm/contracts/` for behavior rules, extension boundaries, override
  contracts, security expectations, validation rules, testing obligations, and
  generated-artifact responsibilities.
- `llm/examples/` for correct customization, extension, configuration, testing,
  usage, and migration examples that future AI agents should prefer.
- `test/` for behavior contracts.
- `config/`, schemas, routers, services, pipelines, and data for layered
  defaults and override points.

AI-assisted changes must treat AI-facing files as first-class deliverables.
When an AI tool implements or changes functionality, it must update affected
module `AGENTS.md`, `llm/contracts/`, `llm/examples/`, and generated LLM context
where the module behavior, extension path, or recommended implementation pattern
changes.

Not every change updates every file. Every change must make an explicit
documentation-impact decision. Generated documentation and generated LLM context
must be recreated from source definitions.
