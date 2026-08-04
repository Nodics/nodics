# Nodics Principles Contract

This contract defines the base principles that every Nodics developer, AI
assistant, module, project, and generated artifact must follow.

Nodics is an enterprise application platform and application factory. It is not
a lightweight API folder, a one-off service scaffold, or a place where each
feature invents its own architecture.

## AI Role And Responsibility Boundary

An AI tool working on Nodics must not behave as a generic coding assistant. It
must act as a Nodics framework expert and governed delivery expert council:
enterprise architect, solution architect, business analyst, principal engineer,
security/privacy/compliance and tenant-governance SME, quality engineering
leader, customer-aware UX thinker, data architecture/governance expert,
AI/tooling governance expert, release/operations expert, and framework
maintainer.

Visible ceremony must be proportional to the task, but these responsibilities
remain active in the reasoning. A small documentation correction can be brief.
A material, cross-module, security-sensitive, tenant-sensitive, data-impacting,
AI/tooling, customer-facing, or release-impacting change must make its business
intent, ownership, affected contracts, evidence, assumptions, unresolved
decisions, and residual risks explicit.

AI role language never authorizes scope expansion. A request to explain,
discover, plan, or review does not authorize implementation, deployment,
publishing, destructive action, external communication, runtime/data mutation,
or residual-risk acceptance. AI tools may not self-approve residual business,
architecture, security, quality, data, UX, release, or operational risks that
require a human or named owner.

## Pre-Implementation Framework Study Gate

Before implementation, human developers and AI tools must build context from
Nodics itself. A non-trivial change is not ready for code until the implementer
has studied the applicable:

- root and module README/AGENTS chain from root to the owning module;
- module `llm/contracts`, `llm/examples`, and generated context;
- source code, tests, schemas, routers, controllers, facades, services,
  providers, interceptors, pipelines, configuration, metadata, data files,
  topology, and generated-artifact definitions;
- class-level and function-level comments/JSDoc in the affected capability and
  direct dependencies;
- sibling and related module patterns;
- nTooling generators, validators, and command contracts;
- online/offline Nodics documentation in `nodicsdocs` when available.

Study depth is proportional, not optional. A trivial typo does not require a
full repository reading exercise. A new capability, cross-module change,
security/data/runtime change, generated-context/tooling change,
partner-facing behavior, or release-impacting change requires deeper study and
must record the studied sources, unresolved gaps, stale documentation risk,
contradictions, intended owner, implementation location, and validation route.

Current repository contracts, source definitions, tests, and governed runtime
behavior resolve conflicts. Generated context, examples, comments, external
documentation, temporary plans, and private chat memory are useful inputs, but
they do not override authored repository authority or current implementation.

Module identity and load order are runtime contracts. Every generated module
or group must receive an explicitly approved, repository-unique ordered index;
generators must fail closed when it is omitted. File-structure validation does
not replace a runtime topology test, because only effective startup proves that
indexes, required modules, and composition order can execute together.

## Regulated compliance capability principle

Regulated verification is an independent backend capability, not a flag owned
by Profile, Payment, Checkout, Order, or a frontend. Profile owns identity,
nMedia owns private files, Workflow owns long-running review, Pipeline owns
deterministic steps, the compliance capability owns policy, cases, checks, and
decisions, and provider modules translate protocols only. Cross-capability
callers consume a scoped eligibility decision and retain their own lifecycle
authority.

Compliance evidence is reference-first, least-privilege, tenant/enterprise
scoped, and append-only when it records consent, checks, final decisions, or
audit. Raw documents, filesystem paths, provider payloads, OCR, biometrics,
credentials, and unnecessary PII must not cross module or browser boundaries.
External callbacks require signature verification, provider/tenant mapping,
idempotency, replay protection, timestamp tolerance, redaction, rate limiting,
and Workflow continuation.

Every regulated capability ships configuration-first policy, explicit intent
routes instead of casual generated mutation, maker-checker extension, private
media and retention/legal-hold contracts, safe errors, observable recovery,
deterministic provider mocks, live-provider readiness evidence, backend-driven
operational metadata, a smallest later-layer customization example, and focused
positive, negative, boundary, and security tests. Never create a parallel
registry, state machine, provider caller, document store, or browser authority
to simplify one integration.

Mock-provider acceptance and production-provider qualification are separate
claims. A development or automated-test acceptance scope may be completed with
an explicitly selected deterministic mock when it exercises the same
provider-neutral contract, idempotency, normalization, safe evidence, failure,
retry, and recovery boundaries. The mock must remain visibly non-production
(`productionReady=false` where that metadata exists), credential-free, and
replaceable through normal module/configuration layering. Never describe mock
acceptance as live-provider certification. A deployment that selects a live
provider must separately prove deployment-owned secrets, accounts, readiness,
timeouts, retries, callbacks, observability, reconciliation, and operational
recovery before production release.

The core rule is:

```text
Capabilities are sacred; implementations are negotiable.
```

In governance checks and implementation reviews, this is enforced as:
capabilities are sacred, implementations are negotiable.

A capability is something the platform can do: expose APIs, define schemas,
persist data, validate requests, run jobs, publish events, index search data,
import/export records, apply permissions, isolate tenants, generate artifacts,
or govern runtime behavior. The capability contract remains stable even
when a project, provider, environment, server, node, tenant, or customer changes
how that capability is implemented.

## Tenant Placement Principle

Tenant is the data-placement, isolation, and runtime-governance boundary. It is
not only a customer label.

A business may use the shared `default` tenant when shared platform
infrastructure is acceptable. A business may use a dedicated tenant when data
privacy, residency, regulatory, operational, or customer policy requires private
database, search, cache, storage, import/export, audit, diagnostics, or runtime
configuration.

Every tenant-sensitive implementation must preserve tenant context before
touching persistence, search, cache, imports, exports, files, events, jobs,
permissions, audit, diagnostics, or runtime governance. Do not hardcode tenant
placement details in feature code.

## Layered Ownership

Every feature must respect the layered module hierarchy.

Framework modules provide default capabilities and behavior. Project,
environment, server, node, tenant, and customer layers may override schemas,
services, routers, pipelines, interceptors, data, tests, configuration, provider
selection, and runtime behavior without changing out-of-the-box Nodics code.

Before changing behavior, identify the smallest layer that can own the change:

1. Customer or project module.
2. Environment, server, or node module.
3. Tenant-aware runtime configuration.
4. Domain or core capability module.
5. Framework module.

Framework code changes only when the framework capability itself is
missing, incorrect, insecure, ungoverned, or impossible to extend cleanly.

## Module-Centric Runtime Principle

Modules are the unit of capability ownership, lifecycle contribution,
registration, discovery, and customization. A runtime instance is a process
hosting an effective active-module set. Environment, server, and node modules
compose processes, coordinates, and instance policy; they do not become
alternate capability owners.

Registries identify `module + runtime instance`, including modules without HTTP
routers. Callable endpoints are conditional metadata, not proof that a module
exists. Client discovery filters the observed module registry to effective,
authorized, client-callable capabilities while target modules retain final
authorization.

Client catalogue metadata is optional module-owned metadata. Aggregators may
validate and filter it but must not duplicate it as configuration or use it to
replace the target module's API authorization.

BackOffice capability discovery consumes the effective contracts already owned
by target modules and Nodics System. Normalized hashes and snapshots are
observations, not editable authority; breaking candidates must not displace the
last safe active observation. Durable history must use ordinary Nodics-owned
persistence contracts. A revision-protected active-observation pointer, not a
process cache or editable catalogue, governs concurrent approval and rollback.

Runtime module claims must be bound to authenticated workload identity and a
specific runtime instance. Identity validation must not treat Profile's local
active-module list as authority for another runtime's module composition.

Deployment-specific BackOffice settings belong in the established `envs`
module-group hierarchy. Framework and capability modules must remain neutral to
named environments.

BackOffice availability is a freshness-bounded observation of target-owned
public readiness, not a second health authority. Missing or stale evidence is
unknown; aggregation must preserve multi-instance partial availability without
exposing raw target diagnostics.

Operational availability events must publish through the existing Nodics event
capability, only on normalized state changes, with low-disclosure runtime
coordinates and stable reason codes. Initial and unchanged results must be
governed to prevent restart or polling storms, and publication failure must not
block registration or module traffic.

BackOffice registry administration must read the owning lease store, bound all
filters and pagination, expose only client-safe projections, use distinct view
and refresh permissions, and invoke existing observers instead of creating a
parallel inventory or refresh mechanism.

Distributed lease cleanup must compare the scanned expiry coordinate inside an
atomic provider operation. Cache reconciliation may remove only ephemeral state
absent from active leases and must not weaken durable active or pending contract
retention.

BackOffice human administration and module self-registration are separate
identity domains. Administrative services must reject service tokens, require a
stable principal, enforce tenant consistency, retain action-specific route
permissions, and bound refresh throttling and idempotency state.

BackOffice probe pressure must be bounded independently of hosted module count.
Core performance evidence should enforce deterministic path and operation
budgets with sanitized timings, while deployment layers own environment-sized
distributed load thresholds.

BackOffice operational readiness may classify existing authoritative
diagnostics but must not become a second health, metrics, or topology authority.
Reusable defaults remain environment-neutral; deployment layers own distributed
store requirements, alert thresholds, secrets, and production load evidence.

## Source Of Truth

Behavior must come from Nodics source-of-truth artifacts:

- active module metadata and hierarchy;
- layered `config/properties.js`;
- tenant and request context;
- schema, route, search, interceptor, pipeline, event, job, import, and export
  definitions;
- loader-visible services, controllers, facades, and utilities;
- runtime governance records;
- tests and generated governance evidence.

Generated LLM context, documentation, and examples help developers understand
the platform, but they do not replace source definitions, configuration, tests,
and runtime governance as authority.

The root `package.json` is the only npm dependency installation authority.
Module `package.json` files are module metadata only and must not declare
`dependencies` or `devDependencies`. Dependency ownership, approved consumers,
and restricted imports are governed by root dependency-governance metadata and
focused tests, not duplicated package-version declarations in module manifests.

## Extension First

Do not edit out-of-the-box Nodics code when a later-loaded module can provide
the required behavior.

Use the standard extension surfaces first:

- `package.json.nodics` metadata for ownership and classification;
- `config/properties.js` for configurable values and policy defaults;
- schemas, routers, search indexes, interceptors, pipelines, events, jobs,
  import/export definitions, services, facades, and controllers for behavior;
- provider modules for databases, cache engines, search engines, messaging
  systems, storage, email, payment, AI, or infrastructure integrations;
- tests, module README files, AGENTS files, LLM contracts, and examples for
  proof and guidance.

If no extension point can safely express the requirement, document the missing
extension point and treat the work as framework-maintainer work.

## Strict Nodics Coding Principles

Implementation must follow these platform coding principles:

1. Understand before editing: identify the business outcome, actors, owning
   capability, owning module, module kind, public contracts, current
   implementation, configuration, consumers, extension points, tests, generated
   artifacts, and relevant documentation before writing code.
2. Capability ownership is mandatory: every behavior, rule, schema, data set,
   API, event, job, integration, and runtime decision has one authoritative
   owner. Consumers invoke or compose the owner's public contract; they do not
   duplicate logic or manipulate owned persistence directly.
3. Reuse, extend, then create: reuse existing capabilities first, customize or
   override through the layered hierarchy second, and create a new authority
   only after repository-backed evidence shows the existing owner cannot
   satisfy the requirement.
4. Configuration first, not configuration only: values and policies that vary
   by project, environment, server, node, tenant, customer, provider,
   deployment, security posture, capacity, timeout, retry, routing, cache,
   audit, validation, or feature selection must resolve through layered
   configuration or governed runtime configuration. Stable protocol constants,
   schema contracts, and security invariants remain code when they are not
   legitimate variation points.
5. Keep layer responsibilities separate: routers declare transport and access
   metadata; controllers map requests; facades orchestrate policy boundaries;
   services own business behavior and provider-neutral abstractions; providers
   translate external protocols; pipelines/interceptors own ordered runtime
   steps; utilities stay stateless and non-authoritative.
6. Stay loader-visible: runtime services, controllers, facades, routers,
   schemas, pipelines, interceptors, events, jobs, data, and tests must live in
   the established Nodics paths and use the expected suffixes and registries.
7. Export runtime behavior as mergeable CommonJS object members, normally
   `module.exports = { methodName: function (...) {} }`, so later modules can
   override the smallest supported function without copying a whole file.
8. Source definitions are authoritative for generated artifacts. Change
   schemas, routers, generation templates, metadata, or source definitions and
   regenerate; do not hand-edit generated output as source truth.
9. Root `package.json` is the only npm dependency installation authority.
   Module manifests remain metadata-only and must not declare package versions.
10. Security, tenant isolation, privacy, auditability, data integrity,
    idempotency, observability, failure handling, rollback/recovery,
    compatibility, and release impact are design inputs, not afterthoughts.
11. Tests prove contracts and risk: include successful, rejected, boundary,
    failure/recovery, security/access, tenant isolation, idempotency,
    concurrency, integration, generated-artifact, and later-layer
    customization tests as applicable.
12. Documentation changes with behavior: update README guidance, AGENTS
    invariants, LLM contracts/examples, canonical documentation, and generated
    context when ownership, behavior, configuration, extension, security,
    operations, or validation changes.
13. Keep changes scoped, reviewable, and recoverable. Do not combine unrelated
    cleanup, formatting, generation, and behavior changes unless the governing
    change gate approves that scope.
14. Completion is evidence-based: report what changed, why it belongs there,
    how it is customized, what was tested, what was not tested, generated/docs
    impact, and residual risks.

## Loader Visibility

Runtime behavior must live where Nodics can discover, merge, and override it.

Keep runtime artifacts inside Nodics loader radar.

Services belong under `src/service/**/*Service.js`. Controllers belong under
`src/controller/**/*Controller.js`. Facades belong under
`src/facade/**/*Facade.js`. Routes belong in `src/router/routers.js`. Pipeline
definitions belong in `src/pipelines/pipelines.js`.

Runtime services, controllers, facades, and pipeline-support files must export
mergeable object members, normally:

```js
module.exports = {
    methodName: function (options) {
        return true;
    }
};
```

Do not hide overridable behavior in private closures, standalone exports, or
custom source folders when a later module must be able to replace one function.

Export runtime behavior as mergeable object members so a later-loaded customer
project module can override the smallest necessary function without modifying
out-of-the-box Nodics code.

## Configuration Ownership

Configurable values, policy defaults, tooling commands, discovery rules,
provider defaults, thresholds, and governance gate data belong in module-owned
`config/properties.js` under clear namespaces.

Put configurable values, policy defaults, tooling command declarations, discovery rules, and governance gate data in module-owned `config/properties.js` under clear namespaces.

Do not introduce parallel config files such as `config/tooling.js`, standalone governance JSON, command registries, or hidden policy files when a
property subtree can own the data. A separate configuration artifact is valid
only when it has a distinct loader, schema, generator, or external override
contract, and that exception must be documented and tested.

## Generated Artifacts

Generated artifacts must be recreated from source definitions during build and
cleaned safely during clean.

Do not hand-maintain generated models, services, facades, controllers, routers,
OpenAPI output, tests, governance reports, or generated LLM context as source
of truth. If generated output is wrong, fix the source definition, regenerate,
and validate.

Every generated artifact should have a source definition, a regeneration path,
a clean path, and validation that detects stale or inconsistent output when
practical.

## Security And Governance

Security, access control, validation, audit, rollback, diagnostics, and test
coverage are platform contracts, not optional enhancements.

Every meaningful behavior change must consider:

- authentication and authorization;
- tenant and customer isolation;
- route permissions and schema access policies;
- validation and error behavior;
- audit, diagnostics, correlation, and sanitized observability;
- rollback or recovery where applicable;
- default behavior and later-layer override behavior;
- generated artifact lifecycle;
- documentation and LLM context impact.

New code must preserve multi-tenancy, modular deployment, runtime
configurability, traceability, and customization through the hierarchy.
Compatibility must be treated as a governed release concern. During the current
pre-production modernization phase, choose clean best-principle implementations
over compatibility shims unless the owner explicitly asks for a compatibility
path.

## Human And AI Equality

Human developers and AI tools follow the same principles. AI tools do not get a
shortcut around Nodics structure, and human developers do not get a shortcut
around AI-facing contracts.

Both must identify the owning capability, choose the correct layer, use
loader-visible source paths, keep configuration layered, preserve generated
artifact ownership, update documentation, and prove behavior through focused
tests.

Documentation changes follow the same source-versus-generated discipline as
runtime code. Every implemented backend module, customer backend, frontend
application, and reusable project updates granular canonical documentation
source and deterministically regenerates its CMS content-pack data. Generated
CMS records are never hand-authored summaries or a second authority. Legacy
README/docs guidance is retired only after a migration register and automated
detail-preservation gates prove that its substantive knowledge is available
through the canonical rendered documentation.

The documentation thumb rule is customization without framework modification.
Every implemented functionality must teach partners, developers, and AI tools
how to use the supported later-loaded extension point, provide the smallest
working project-owned example, identify preserved contracts and prohibited
bypasses, and name the tests that prove the customization. Documentation that
describes behavior without its safe customization path is incomplete.

## Change Acceptance Contract

This contract applies to every modification and every new source file. A change
is not complete merely because its default implementation works.

Use `contracts/developer-implementation-contract.md` when deciding where a
feature belongs, which extension point should own it, and how human developers
or AI tools should guide implementation without bypassing Nodics module,
generated-layer, tenant, data, security, runtime-governance, release, or
documentation contracts.

Every change must:

- follow established Nodics module, loader, registry, schema, service, facade,
  controller, router, pipeline, interceptor, validator, data, configuration,
  and runtime-governance patterns;
- avoid parallel mechanisms when an existing extension mechanism owns the
  capability;
- resolve implementation choices from the effective active module hierarchy,
  layered configuration, tenant/request context, source definitions, and
  governed runtime state;
- keep runtime artifacts inside Nodics loader radar and use mergeable CommonJS
  object-member exports for overridable behavior;
- derive generated artifacts from source definitions and regenerate them
  through the governed build/generation path;
- document purpose, owner, layer, extension path, inputs/outputs, side effects,
  failure behavior, and exported methods for every new source file;
- include positive, negative, security/access, tenant, data, failure/recovery,
  and traceability tests as applicable;
- include an override/customization test for every new or changed extension
  point, proving that a later-loaded customer project module can change the
  behavior without modifying out-of-the-box Nodics code;
- update module README, AGENTS guidance, LLM contracts/examples, canonical
  documentation, and generated context when ownership, configuration,
  dependencies, extension points, runtime behavior, or operational contracts
  change.

Code review must reject a change whose customization path is absent, undocumented, or untested.

## Completion Rule

A change is complete only when behavior, configuration, generated artifacts,
tests, public documentation, module README guidance, AGENTS guidance, LLM
contracts/examples, and generated LLM context are consistent for the affected
capability.
