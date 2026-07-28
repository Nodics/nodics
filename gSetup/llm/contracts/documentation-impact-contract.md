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

Canonical public documentation content belongs in the separate `nodicsdocs`
repository and is projected into Nodics CMS through the governed content-pack
contract. `gDocs` is frozen migration evidence until its retirement gate
passes; it is not the authority for new public guidance. Root `docs/` is
temporary, untracked, and non-runtime unless implemented material is explicitly
promoted. The Nodics root README remains the repository entry point and must
link readers toward canonical capability journeys for business evaluators,
beginners, builders, architects, security reviewers, and operators. Public task
pages must link to their next useful action and owning module detail.

Run Nodics documentation-governance checks for repository links, ownership,
module coverage, and generated AI context. Run the `nodicsdocs` coverage, depth,
content-pack, and link checks when canonical public content changes. Neither
repository may create a second public documentation authority.

Promotion is evidence-based. Canonical `nodicsdocs` content, module
`README.md`, canonical documentation content, and generated context must describe functionality
that exists in authoritative source/configuration/runtime contracts and has
appropriate validation evidence. Keep proposals, future architecture,
unresolved decisions, backlogs, and action plans under root `docs/` while they
remain unimplemented. When implementation differs from a plan, update the
temporary plan first; promote only the behavior that was actually implemented
and verified. Do not create permanent public documentation merely to preserve a
future idea.

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

## Documentation Detail Preservation Contract

Documentation is a product capability, not a short summary of source code.
Human contributors, partners, generators, migration tools, and AI tools must
preserve or increase useful verified detail whenever documentation is created,
restructured, migrated, or updated.

The following rules are mandatory:

1. Never reduce a complete guide merely to make it shorter, easier to generate,
   visually simpler, or compliant with a minimum word count.
2. Preserve verified business context, beginner explanations, terminology,
   concepts, architecture, configuration, defaults, precedence, extension
   points, examples, tables, security, tenant behavior, performance,
   observability, operations, failures, recovery, troubleshooting, limitations,
   and verification whenever applicable.
3. Capability-first restructuring may change titles, grouping, sequence, and
   language. It must not silently discard unique knowledge from an
   authoritative or reviewed migration source.
4. Keep stronger explanations, scenarios, decisions, and limitations already
   added to a canonical destination. A synchronization tool may replace only
   content attributed to the same recorded evidence source.
5. Do not invent behavior to make a page appear complete. Verify claims against
   current source, properties, schemas, routes, services, tests, module
   technical documentation, and controlled runtime evidence.
6. State whether behavior is implemented, configurable, guarded,
   provider-dependent, scaffolded, deprecated, or planned. Planned behavior
   remains outside published runtime documentation until its implementation and
   tests exist.
7. Write for partial discovery. A reader arriving through search must
   understand purpose, prerequisites, authority, context, expected result,
   limitations, and the next action without reading the whole repository.
8. Reuse and extend an existing canonical page before adding another
   authority. Do not create parallel guides, terminology sources, configuration
   authorities, migration paths, or generated content paths.
9. Removing documented behavior requires evidence of a governed implementation
   removal, a reviewed correction of inaccurate or unsafe guidance, a named
   canonical destination preserving the knowledge, or an explicit archive or
   reject decision with a reason.
10. Page splitting, navigation redesign, rewording, or generator convenience is
    not sufficient reason to remove detail.
11. Every overview begins by defining the topic in plain language, using a
    familiar analogy, explaining why an application needs it, and walking
    through a small example before business outcomes, architecture,
    configuration, or operations. Do not assume a graduate, evaluator, or
    first-time reader already knows the underlying technology.
12. Navigation expresses the learning journey, not implementation containment.
    Framework orientation belongs in discovery; capability hubs remain owned
    by the capability section instead of becoming children of one architecture
    article.
13. Preserve reviewed diagrams and images as governed structured media with
    alternative text, integrity evidence, safe transport, and responsive
    rendering. Do not leave image Markdown as visible text, copy canonical
    media into each frontend, or silently discard it during generation.
14. Inline presentation syntax is a bounded declarative contract. Consumers
    may render allowlisted links, emphasis, and inline code, but must reject raw
    HTML, executable markup, unsafe URL schemes, and arbitrary styles.
15. Complex process documentation must use diagrams when they make the
    relationship materially easier to understand. Pipelines, workflows,
    import/export lifecycles, publishing flows, authentication boundaries,
    provider routing, event delivery, and runtime startup sequences should
    include a small declarative diagram when the reader would otherwise need to
    mentally connect three or more dependent steps. The diagram must be paired
    with plain-language explanation, stable step names, accessible alternative
    text or equivalent prose, and source-backed behavior. Do not add diagrams
    as decoration, and do not use diagrams to hide unsupported or planned
    behavior inside published documentation.

Minimum word and section counts are lower-bound defect detectors only. They do
not prove accuracy, usefulness, audience completeness, evidence coverage, or
source preservation.

## Documentation Generation and Review Contract

Before creating or changing canonical public documentation:

1. identify the capability, owner, primary reader intent, and applicable
   audiences;
2. search existing canonical content and technical evidence before adding a
   page;
3. collect current implementation, configuration, schema, API, event, test,
   operational, and module-owned evidence;
4. reconcile conflicts using Nodics-owned runtime contracts as the behavior
   authority;
5. document the applicable business, beginner, developer, architecture,
   security, tenancy, performance, observability, operations, failure,
   recovery, customization, and verification concerns;
6. include a recognizable end-to-end example plus rejected, boundary, failure,
   and recovery behavior where the capability changes data, access, money,
   publishing, workflow, external systems, or runtime state;
7. include a declarative process diagram for non-trivial pipelines, workflows,
   lifecycle orchestration, import/export, provider routing, publishing,
   authentication, or runtime startup flows when the visual materially improves
   comprehension;
8. explain the smallest supported later-loaded project customization without
   editing Nodics framework source or creating a parallel authority;
9. record evidence, ownership, maturity, limitations, and last verification;
10. update all affected destinations when one implementation change affects
   multiple audiences or contracts;
11. regenerate derived content and run Nodics plus `nodicsdocs` validation
    proportionate to the change.

## Customization-First Documentation Rule

The primary adoption outcome of Nodics documentation is that a partner,
developer, or AI tool can understand an implemented capability and customize
it safely without editing framework-owned source. Every capability and
functionality page family must therefore document:

1. what the out-of-the-box capability owns and guarantees;
2. the supported later-loaded project, module, provider, configuration,
   schema, service, facade, controller, pipeline, event, renderer, or data
   extension point, as applicable;
3. the smallest complete customization example with exact files, properties,
   registrations, commands, and expected result;
4. which contract is preserved and which behavior the custom layer may replace
   or compose;
5. prohibited shortcuts, including framework edits, copied loaders, duplicate
   registries, parallel persistence, client-side business authority, and
   bypassed security or validation;
6. positive, rejected, boundary, integration, and regression tests proving the
   customization against the effective layered runtime;
7. upgrade, rollback, troubleshooting, and compatibility implications.

If an implemented capability has no safe extension point, its documentation
must state that limitation explicitly and the capability is not considered
partner-customizable. A high-level sentence saying that Nodics is extensible
does not satisfy this rule.

Every implemented module or application feature must update its granular
canonical structured documentation source in the same change. The generated
CMS page, component, navigation, route, search, and manifest records are
derived release artifacts; they must never become a shorter hand-maintained
documentation authority beside a richer README or the canonical content pack.

A generator must be deterministic and expose a check mode that fails when
committed CMS import data is stale. Migration or retirement requires a register
that maps every reviewed README/docs source to a canonical destination with a
disposition, content hash, substantive headings, and detail evidence.
README/docs content may be reduced only after source coverage, detail
preservation, generated-pack validation, link/media validation, and rendered
frontend review pass. Moving evidence to untracked root `docs/` before this
gate is content loss, not migration.

Every module and project keeps a concise high-level `README.md` after detailed
content moves into the canonical documentation pack. It must summarize purpose,
ownership, implemented capabilities, setup, verification, safe extension
boundaries, and links to the canonical detail. Migration may retire duplicated
retired module documentation after the evidence gates pass, but it must never
leave a module without its local README entry point or create a parallel
module-level documentation tree.

## Project Documentation Content-Pack Contract

Every backend project, frontend project, reusable application, and implemented
functionality must ship documentation proportionate to what it contributes.
Documentation is part of feature acceptance; tests and source code alone do not
make a capability adoptable.

A project that supplies CMS-importable documentation data uses this stable
release shape:

```text
project/
  data/
    core/
      headers/
      data/
        documentation/
  manifest/
    docs-content-pack.json
```

The manifest name is exactly `docs-content-pack.json`. Do not introduce
`documentation-content-pack.json`, project-specific manifest names, or another
import authority. Generated or assembled `data/core` is committed,
deterministic, and directly consumable by the existing Nodics content-pack and
`nImport` contracts. The project repository owns its source-controlled
documentation release; CMS is the runtime projection.

The project must declare one canonical structured documentation source outside
generated `data/core`. Content should be split into independently navigable
pages at the level users search, learn, operate, troubleshoot, customize, and
verify a capability. One coarse project overview or one summary page per module
does not satisfy the contract when richer implemented feature guidance exists.

Frontend startup may discover documentation-pack status and present authorized
Import or Update actions. A frontend must never read sibling files, write CMS
records, connect to the database, or automatically mutate persistent
documentation merely because the browser application started. Nodics backend
configuration owns pack discovery, compatibility, checksum validation,
permissions, startup policy, locking, import history, and import execution.

Each project or reusable application guide must cover, where applicable:

1. project purpose, supported business outcomes, users, and explicit
   limitations;
2. repository ownership and the boundary between framework, project backend,
   frontend presentation, CMS content, and generated artifacts;
3. the technology stack, exact supported version ranges, runtime requirements,
   dependency policy, build toolchain, and upgrade procedure;
4. installation, configuration, environment variables, local start, production
   build, deployment shape, and compatibility matrix;
5. route and page organization, navigation ownership, layouts, templates,
   slots, components, loading/empty/error/recovery states, and responsive or
   mobile-WebView behavior;
6. one-renderer-per-file organization, typed renderer registry, logical
   renderer keys, contract versions, supported channels, deprecation behavior,
   unknown-renderer failure behavior, and focused mirrored tests;
7. how backend CMS page, template, slot, component, type-code, and renderer
   models map to frontend-owned implementations without sending executable
   frontend code from the backend;
8. API and OpenAPI dependencies, authentication, authorization, tenant and
   enterprise context, browser-session security, error-code handling, and
   frontend versus backend validation responsibilities;
9. server-state and presentation-state ownership, caching, localization,
   accessibility, keyboard/touch behavior, performance, security headers, and
   safe rendering constraints;
10. supported project customization and extension paths, including what later
    layers may replace and which framework or backend authorities they must not
    bypass;
11. observability, diagnostics, failure modes, troubleshooting, recovery,
    migration, rollback, and operational ownership;
12. positive, negative, permission, boundary, responsive, contract,
    integration, regression, and production-build verification with exact
    commands and expected results.

For every implemented project functionality, include a dedicated
**Customize and extend safely** section. It must identify the authoritative
owner, show the smallest supported project-owned customization, name the files
that belong in the custom project, state what must not be copied or bypassed,
and provide the tests that protect the extension across framework upgrades.

When one functionality spans repositories, each repository documents only its
owned implementation boundary and links to the canonical end-to-end capability
journey. Do not duplicate business authority in a frontend guide or frontend
implementation detail in a backend module guide.

For a migration or merge, every reviewed source receives a disposition and
destination or an archive/reject reason. Mapped instructional sources must keep
their substantive headings and detailed content. Links are normalized to
canonical routes, and generated CMS blocks are reviewed in addition to authored
structured source.

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
