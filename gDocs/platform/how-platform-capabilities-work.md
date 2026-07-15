# How Platform Capabilities Work

Nodics is built as a platform, not as a single API application. Platform capabilities provide reusable behavior that many business modules can use: request handling, processes, cache, messaging, logging, import/export, testing, runtime governance, and deployment topology.

Nodics implements platform capabilities through active modules, source definitions, layered configuration, runtime governance, generated artifacts, and tests.

## Platform Capability Rule

A platform capability is reusable, configurable, tenant-aware where required, and replaceable through a later module.

Before adding or changing a platform feature, ask:

- Which module owns the capability?
- Which source definition controls the behavior?
- Which configuration values can change by project, environment, server, node, tenant, or runtime governance?
- Which services, pipelines, events, or routers execute the behavior?
- Which tests prove default behavior and override behavior?
- Which documentation and generated LLM context must be updated?

Do not add platform behavior as one-off helper code. Platform behavior has an owner, a contract, a configuration path, and a test boundary.

## Request Handling

Request handling is the path from an incoming API call to secured business behavior.

A request normally passes through:

1. Route registration.
2. Request metadata and header normalization.
3. Tenant and context resolution.
4. Authentication and authorization.
5. Controller execution.
6. Facade or service orchestration.
7. Data access, search, cache, event, or workflow behavior.
8. Response and diagnostics handling.

The route definition makes the API contract visible. Permission behavior, pre-authentication behavior, cache policy, help metadata, and OpenAPI generation come from route/source metadata, not from hidden controller assumptions.

## Processes And Workflows

Model process-style behavior through the owning module's pipeline, workflow, event, job, or service contract.

Use process or workflow behavior when:

- work has multiple steps;
- steps may pause, resume, retry, split, or continue through events;
- a business operation needs lifecycle state;
- multiple services or modules must participate in a governed order.

Keep the process definition separate from the implementation. The definition explains the intended process. Services, handlers, interceptors, pipelines, and workflow actions perform the work.

## Cache Management

Cache exists to improve performance without becoming a second source of truth.

Use cache for repeatable reads, computed values, remote lookup results, auth/session acceleration, or expensive data that can be safely refreshed.

When adding cache behavior, document:

- what is cached;
- who owns the cached value;
- cache key structure;
- tenant/customer isolation;
- expiry and invalidation behavior;
- provider selection;
- failure behavior when the cache is unavailable;
- diagnostics and tests.

Provider-specific behavior belongs in provider modules such as Node cache, Redis, or Hazelcast support. Generic modules should depend on the cache capability contract, not on one provider's implementation.

## Messaging And Events

Messaging lets modules communicate without forcing every operation into a direct API call.

Use events or messages when:

- another module should react after a business change;
- work can be asynchronous;
- the producer does not own the consumer's implementation;
- a provider such as Kafka or ActiveMQ may be used behind the same capability.

Messaging contracts define event names, payload shape, tenant context, retry behavior, error handling, and diagnostics. Provider configuration, broker endpoints, credentials, queue names, and topic names must be layered configuration or governed secrets, never hardcoded in source.

## Logging And Diagnostics

Logs and diagnostics are part of platform governance.

Good diagnostics identify:

- module;
- operation;
- tenant or customer context where safe;
- correlation id;
- result;
- reason code for failure;
- sanitized error detail.

Logs must not expose credentials, tokens, secrets, or sensitive payloads. When a failure affects runtime governance, imports, jobs, messaging, or security, diagnostics support audit and rollback decisions.

## Data Import And Export

Import/export is a platform capability because many modules need controlled data movement.

The import/export contract defines file format, headers, target schema, tenant, validation, duplicate handling, diagnostics, run history, retry behavior, and rollback impact.

Format-specific support such as JavaScript, JSON, CSV, and Excel belongs in provider modules. New formats should follow the same provider pattern instead of changing the generic import/export engine directly.

## Runtime Governance

Runtime governance allows controlled changes after deployment.

Use runtime governance for changes that need preview, request, approval, activation, audit, diagnostics, and rollback. Runtime governance must not become a hidden source of architecture. Source definitions, module metadata, layered configuration, and tests remain the authority for platform contracts.

## Testing Platform Capabilities

Platform capabilities need more than happy-path tests.

Test:

- default behavior;
- later-module override behavior;
- tenant isolation;
- permission and access failure;
- provider selection;
- diagnostics and sanitized failure output;
- consolidated runtime behavior;
- modular server-to-server behavior where applicable.

Use generated tests when schema or route definitions change, and add focused tests for provider, process, cache, messaging, and runtime-governance behavior.

## What To Avoid

Avoid:

- using cache as the only source of truth;
- hardcoding provider endpoints or credentials;
- bypassing tenant context in events, logs, imports, or cache keys;
- hiding permissions inside controllers;
- creating background processes with no owner or diagnostics;
- adding platform helpers outside loader-visible module paths;
- changing framework code when a provider or project module can own the customization.
