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

Permanent public documentation belongs in `gDocs`; root `docs/` is temporary,
untracked, and non-runtime unless material is explicitly promoted. The root
README is the public entry point and must provide reachable journeys for
business evaluators, beginners, builders, architects, security reviewers, and
operators. Public task pages must link to their next useful action and owning
module detail. Run `npm run quality:docs` to validate links, path case,
reachability, page continuation, required entry points, and module-catalog
coverage through the existing documentation-governance authority.

Promotion is evidence-based. `gDocs`, module `README.md`, module `docs/`, and
generated context must describe functionality that exists in authoritative
source/configuration/runtime contracts and has appropriate validation evidence.
Keep proposals, future architecture, unresolved decisions, backlogs, and action
plans under root `docs/` while they remain unimplemented. When implementation
differs from a plan, update the temporary plan first; promote only the behavior
that was actually implemented and verified. Do not create permanent public
documentation merely to preserve a future idea.

## Distributed Discovery Contract

Nodics cannot assume that a developer or AI tool reads the complete
documentation set. Every implementation boundary must be safe when discovered
from the nearest files only.

The minimum local discovery chain is:

1. root `AGENTS.md` defines platform-wide non-negotiable principles;
2. the nearest module-group and module `AGENTS.md` define ownership,
   dependencies, invariants, prohibited bypasses, and extension rules;
3. the module `README.md` explains the capability, configuration, source map,
   supported customization, and verification entry points;
4. `llm/contracts/` states executable behavior and placement rules;
5. `llm/examples/` demonstrates the smallest supported layered customization;
6. generated module context reports current source-derived ownership and gaps;
7. focused tests enforce the rules that must not depend on contributor memory.

Do not place a critical rule only in a distant public guide, planning document,
prompt, or generated summary. Repeat a concise local rule when it is necessary
to make the module safe in isolation, while linking to the canonical detailed
contract instead of copying its complete text.

## Capability Documentation Acceptance Matrix

Every implemented end-to-end capability must address these audiences:

| Audience | Required explanation |
| --- | --- |
| Business evaluator | Problem, business value, supported decisions, limitations, cost/risk impact, and realistic use cases. |
| Business user | Prerequisites, terminology, roles, step-by-step happy path, rejected path, failure, retry, recovery, and expected result. |
| Administrator/operator | Configuration, permissions, secrets, limits, monitoring, alerts, backup/restore, migration, rollback, and troubleshooting. |
| Application developer/partner | Owning repository/module/layer, contracts, APIs, schemas, events, configuration, extension example, prohibited bypasses, and tests. |
| Framework maintainer/AI tool | Authority map, dependency direction, loader path, override boundary, generated impact, invariants, and acceptance proof. |

If an audience or concern is not applicable, the owning documentation must say
why. Silence is not evidence that impact was considered.

## Use-Case And Example Contract

Documentation must teach with concrete, named scenarios rather than only list
types and methods. Each significant capability needs:

- one smallest successful example;
- one rejected or unauthorized example;
- one boundary or scale example;
- one failure and recovery example;
- one later-loaded project customization example;
- exact files, properties, permissions, commands, requests, and expected
  outcomes where applicable.

Examples must call authoritative APIs and services. They must not normalize
direct database edits, copied framework services, inline secrets, generated
file edits, or parallel loaders as customization techniques.
