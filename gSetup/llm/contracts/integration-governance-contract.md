# Integration Governance Contract

This contract governs every external/provider integration used by Nodics or a
customer project. It applies to search engines, cache engines, logging sinks,
messaging providers, storage providers, email services, AI providers,
databases, payment gateways, infrastructure adapters, and future external tool
bridges.

Nodics source definitions, layered configuration, runtime governance, tenant
context, and tests remain the authority. MCP servers and external provider
tools may expose, explain, validate, and operate this contract, but they must
not become a hidden source of architecture or configuration truth.

## Capability Owner Rule

Every integration must declare its owning Nodics capability module or
project-owned module before implementation begins.

Examples:

- search providers are owned by `nSearch` or a project search module;
- cache engines are owned by `nCache` or a project cache module;
- event/messaging providers are owned by `nEms`, `nEvent`, or a project event
  module;
- database providers are owned by `nDatabase` and provider modules such as
  MongoDB, Cassandra, or a project Oracle module;
- import/export providers are owned by `nData`, `nImport`, `nExport`, or a
  project data module;
- cron and scheduled infrastructure behavior is owned by `cronjob` or a
  project scheduler module;
- payment, email, AI, storage, or infrastructure adapters must be owned by an
  explicit project or framework capability module before they are used.

AI tools and developers must identify the owner before recommending code
changes. If no owner exists, create or design the owner first; do not embed
provider calls directly in unrelated business modules.

## Provider Selection Rule

Active providers, engines, and adapters must be selected through Nodics-owned
source-of-truth inputs:

- layered `config/properties.js`;
- runtime governance and approved runtime configuration;
- tenant, environment, server, and node configuration;
- module metadata and active-module registration;
- explicit provider capability metadata.

Do not hardcode provider choices in source code when the implementation is
negotiable. Source code may define safe framework defaults and capability
contracts, but project or runtime layers must be able to select a different
provider without modifying out-of-the-box framework files.

## Connection And Secret Configuration

Connection details must come from governed configuration or secret management.
This includes URLs, hosts, ports, credentials, TLS settings, pools, timeouts,
retry policy, backoff policy, key/index/topic prefixes, database names,
region/account identifiers, and provider-specific namespaces.

Rules:

- never hardcode credentials or tenant-specific endpoints in source;
- treat secret paths as configuration, not as secrets themselves;
- keep logs, generated context, MCP output, and diagnostics credential-free by
  default;
- expose only safe metadata to MCP or external tools unless an explicit
  permissioned operation allows more;
- document restart/runtime behavior for each connection setting;
- define fallback, disable, and fail-closed behavior for missing or invalid
  connection configuration.

## Abstraction Boundary Rule

Business modules must call Nodics-owned services, facades, pipelines, handlers,
exporters, indexers, cache services, log services, event services, or provider
adapter services. They must not call external provider libraries directly unless
the module explicitly owns that adapter.

Provider modules may depend on provider SDKs. Business modules depend on
Nodics contracts. This keeps implementations negotiable while preserving the
capability contract.

If a provider cannot be plugged in through existing metadata, configuration,
services, handlers, or adapter contracts, document the missing extension point
and treat the work as framework-maintainer mode. Do not bypass the
provider-neutral module to ship a quick integration.

## Data Flow And Trigger Contract

Every integration must document how data enters, moves through, and leaves the
provider boundary. The data-flow contract should identify:

- API routes and controllers that trigger provider work;
- import/export headers, files, adapters, and processors;
- indexers and search refresh paths;
- cache writers, readers, invalidation events, and flush operations;
- event publishers, consumers, listeners, topics, queues, and retry paths;
- log sinks, audit writers, diagnostics reporters, and health checks;
- cron jobs, startup tasks, pipelines, interceptors, and runtime activation
  events;
- tenant, enterprise, request, correlation, and trace context carried through
  the provider call.

Provider behavior must be observable through Nodics diagnostics and tests, not
only through provider dashboards.

## Tenant, Environment, Server, And Node Overrides

Projects must be able to change provider behavior through later layers without
editing framework modules.

The integration contract must define which layer may override:

- provider or engine selection;
- connection endpoint, namespace, index prefix, topic, queue, bucket, database,
  table, collection, or account;
- schedule, consumer ownership, node affinity, concurrency, pool size, timeout,
  retry, circuit breaker, and health-check behavior;
- feature enablement, fallback, dry-run, validation-only, and fail-closed mode;
- tenant-specific configuration and cross-tenant permissions.

Environment modules own deployment-wide defaults. Server modules own runnable
process composition and remote endpoints. Node modules own instance-specific
ownership, capacity, and diagnostics. Tenant runtime governance owns
tenant-specific behavior.

Modules remain the integration capability and registration unit across every
composition. Do not describe a fixed set of configured servers as the platform
module model. Discovery records which module capabilities are observed on each
runtime instance; server and node metadata are deployment coordinates only.

An identity provider may validate the shape and authenticated authority of a
runtime's declared module claims, but it must not use its own local
active-module composition as authority for another runtime. Production module
claims should be bound to per-runtime credentials or infrastructure workload
identity. Shared bootstrap credentials are development compatibility, not the
target production trust model.

## Security, Redaction, Audit, Diagnostics, And Rollback

Every integration must preserve platform security contracts:

- authenticate and authorize provider-triggering APIs through Nodics routes,
  permissions, or runtime governance;
- keep credentials and sensitive payloads out of logs, audits, generated
  context, and default MCP output;
- include reason codes, trace IDs, correlation IDs, tenant, module, operation,
  provider, adapter, and target metadata in safe diagnostics;
- define health checks and release gates for critical providers;
- fail closed when strict distributed, security, or provider capability is
  required but unavailable;
- define rollback, disable, drain, retry, replay, poison-message, cleanup, or
  compensation behavior when the provider mutates external state.

Audit records should identify what Nodics asked the provider to do, who or what
requested it, which tenant and module owned it, and whether the operation was
previewed, approved, applied, failed, retried, rolled back, or skipped.

## Test Expectations

Integration work is incomplete without tests proportionate to risk:

- deterministic contract tests for provider-neutral services and adapters;
- configuration-resolution tests for provider selection and layered overrides;
- tenant isolation tests for data, cache, search, messages, logs, credentials,
  and runtime governance;
- negative tests for missing config, disabled providers, unsupported adapters,
  invalid permissions, and failed health checks;
- optional guarded live-provider tests for Redis, search engines, message
  brokers, databases, email, storage, payment, AI, or infrastructure providers;
- release gates for critical providers that cannot be safely mocked;
- override/customization tests proving later modules can replace or tune the
  provider without editing out-of-the-box Nodics code.

Live-provider tests must be guarded by explicit configuration and must not run
accidentally against production tenants or shared provider accounts.

## MCP Exposure Boundary

Nodics MCP may expose:

- owning module and provider-neutral capability;
- active provider, adapter capability metadata, and safe health/status;
- effective configuration keys and safe values;
- secret paths without secret values;
- extension points and override paths;
- validation commands and structured test results;
- safe diagnostics, reason codes, audit references, and topology hints.

External provider MCPs may explain or inspect their provider, but Nodics MCP
remains authoritative for how Nodics is allowed to use that provider. Provider
MCP output must be reconciled back to Nodics module ownership, configuration,
tenant context, and governance before any code or runtime change is made.

MCP tools must not write hidden configuration, create untracked provider state,
or mutate runtime behavior outside Nodics governance.

The first supported Nodics MCP surface is read-only governance context exposed
through the nTooling `mcp:governance` command. It may report workspace summary,
module discovery, nearest `AGENTS.md`, generated module context, and
change-impact guidance. It must not persist decisions, mutate source, mutate
runtime configuration, regenerate artifacts, change data, call providers, or
replace Nodics validation and active-module resolution.

The expanded MCP surface remains staged and governed:

- `mcp:validate` may run only approved Nodics validation commands and return
  structured results.
- `mcp:runtime-context` may explain active-module hierarchy, artifact
  ownership, and override paths from source files and metadata without
  bootstrapping or mutating runtime configuration.
- `mcp:mutation-plan` may create guarded plans for module skeletons,
  documentation updates, generated artifacts, build, and clean actions, but it
  does not execute writes by default and must require explicit developer
  approval before any mutation-capable executor is trusted.

Customer projects must extend MCP behavior through later module tooling
contributions before editing Nodics framework files. The preferred path is to
keep the built-in nTooling handler alias, such as
`@nTooling/mcp-mutation-plan`, and override behavior through the standard service merge path. A customer module can add
`src/service/mcp/defaultMcpMutationGuardService.js` and export only `createPlan`
to replace that function while inheriting the rest of the framework service.
Replacing an MCP handler is a larger change and must use
`$override.mode: 'replace'`.

## Provider Runtime Lifecycle

Every long-lived provider connection or workload must contribute bounded
readiness, drain, and shutdown behavior through the single runtime lifecycle
and health contracts owned by Nodics. Provider modules retain their resource
ownership; no provider may install an independent process-signal handler,
readiness authority, or parallel lifecycle coordinator.

Readiness contribution must follow layered activation and must not activate or
probe a disabled provider merely because connection values exist. Shutdown must
close each owned connection once, tolerate partial initialization, and avoid
including provider credentials or connection settings in diagnostics.

## Completion Checklist

An integration is complete only when:

- the owning module and provider adapter are declared;
- `gDocs/reference/provider-capability-maturity-matrix.md` reflects the
  provider or capability maturity level;
- root dependency governance and the owner module `package.json` declare any
  external SDK, provider adapter, or runtime package used by the integration;
- provider selection is layered and overrideable;
- connection and secret configuration are governed and redacted;
- business modules call Nodics contracts rather than provider SDKs directly;
- data flow and triggers are documented;
- tenant, environment, server, and node override behavior is defined;
- security, audit, diagnostics, health, rollback, and failure handling are
  implemented or explicitly out of scope;
- deterministic, negative, tenant, override, and optional live-provider tests
  pass;
- README, AGENTS, module docs, LLM guidance, and generated context are updated.
