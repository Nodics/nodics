# Nodics Principles Contract

This contract defines the base principles that every Nodics developer, AI
assistant, module, project, and generated artifact must follow.

Nodics is an enterprise application platform and application factory. It is not
a lightweight API folder, a one-off service scaffold, or a place where each
feature invents its own architecture.

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

Runtime module claims must be bound to authenticated workload identity and a
specific runtime instance. Identity validation must not treat Profile's local
active-module list as authority for another runtime's module composition.

Deployment-specific BackOffice settings belong in the established `envs`
module-group hierarchy. Framework and capability modules must remain neutral to
named environments.

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

## Loader Visibility

Runtime behavior must live where Nodics can discover, merge, and override it.

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

## Configuration Ownership

Configurable values, policy defaults, tooling commands, discovery rules,
provider defaults, thresholds, and governance gate data belong in module-owned
`config/properties.js` under clear namespaces.

Do not introduce parallel configuration files such as `config/tooling.js`,
standalone governance JSON, command registries, or hidden policy files when a
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

## Completion Rule

A change is complete only when behavior, configuration, generated artifacts,
tests, public documentation, module README guidance, AGENTS guidance, LLM
contracts/examples, and generated LLM context are consistent for the affected
capability.
