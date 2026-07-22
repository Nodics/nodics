# Provider And Capability Maturity Matrix

This page shows the current maturity of major Nodics capabilities and provider
adapters. Use it before selecting a capability for production work, before
adding a new provider, and before an AI tool recommends implementation steps.

The matrix is not a marketing checklist. It is an engineering control that
keeps capability status visible, testable, and honest.

## Maturity Levels

| Level | Meaning | Allowed Use |
| --- | --- | --- |
| Production-ready capability | The framework contract is implemented, documented, covered by deterministic tests, and ready for project use after normal project configuration, secrets, tenant setup, and release validation. | Use for project implementation. Keep module contracts, tests, and documentation aligned when extending. |
| Guarded provider | The provider or runtime behavior exists, but live use requires explicit configuration, secrets, topology, tenant isolation, and guarded release/integration tests. | Use when the project owns the provider setup and runs the required gate. Do not make basic tests depend on it. |
| Sample or reference | The module, data, or topology exists to demonstrate Nodics behavior, seed local development, or prove structure. | Use for learning, local validation, examples, and project skeleton decisions. Do not treat sample values as production policy. |
| Placeholder or scaffold | The capability boundary exists, but the provider or feature is not complete enough for production behavior. | Keep it fail-closed or inactive. Implement the missing provider contract before using it. |
| Parked future capability | The need is known, but the implementation is intentionally deferred. | Keep documented in backlog and design notes. Do not expose public runtime behavior until owned and tested. |

## How To Use This Matrix

Before using or changing a capability:

1. Identify the owning module.
2. Check the maturity level.
3. Read the module `README.md` and any linked `gDocs` page.
4. Confirm which provider or engine is active through layered configuration.
5. Run the focused tests for the capability.
6. Use `npm run release:check` before claiming release readiness.

If a project needs a capability at a stronger level than this page lists, the
project must implement the missing provider, tests, documentation, operations
rules, and release gate. Do not silently treat guarded or scaffolded behavior as
production-ready.

## Core Runtime Capabilities

| Capability | Owner | Current Maturity | Notes And Required Gate |
| --- | --- | --- | --- |
| Module loading and configuration hierarchy | `nConfig`, `nCommon` | Production-ready capability | Metadata-driven project, environment, server, node, tenant, and active-module loading is governed and tested. Changes require configuration, topology, and LLM validation. |
| Router registration and request pipeline | `nRouter`, `nController`, `nFacade`, `nService` | Production-ready capability | Routes, controllers, request pipeline, response envelope, API method standards, OpenAPI generation, exposure gates, and route permissions are tested. |
| Pipeline framework | `nPipeline` | Production-ready capability | Pipeline definitions, nodes, processors, interceptors, override rules, and examples are documented. Runtime changes must preserve ordered execution and failure behavior. |
| Runtime governance | `nDynamo` | Production-ready capability | Runtime configuration preview, request, approval, activation, audit, rollback, cleanup, and schema access policy behavior are covered by deterministic tests. Production exposure still depends on topology gates and permissions. |
| Testing and generated contracts | `nTest`, `nTooling` | Production-ready capability | Generated schema/API/scenario tests, module-owned tests, docs gates, LLM validation, structure audit, and release checks are wired through tooling. |
| LLM/developer governance | `gSetup/llm`, module `AGENTS.md` | Production-ready capability | AI and human developer contracts define ownership, structure, layering, testing, release, and implementation rules. Keep generated context current after behavior changes. |

## Security And Identity

| Capability | Owner | Current Maturity | Notes And Required Gate |
| --- | --- | --- | --- |
| Human authentication and profile identity | `nAuth`, `profile` | Production-ready capability | Login, route-security boundary, identity bootstrap, service account groups, token invalidation, audit redaction, and permission resolution are covered. Production requires governed secrets, not local sample values. |
| Internal service token access | `nAuth`, `nService`, `profile` | Production-ready capability | Internal token access remains secured and separate from pre-authentication login routes. Service credentials must come from governed bootstrap sources. |
| Strict distributed auth cache | `nAuth`, `nCache`, `redisCache` | Guarded provider | Redis-backed strict shared-cache behavior is required for distributed auth state. Live Redis validation is guarded and must run in release/deployment environments. |
| Local compatibility cache for auth state | `nodeCache` | Sample or reference | Useful for local development where strict distributed auth is not required. It must not be selected for strict distributed auth contracts. |
| OTP and token lifecycle | `nOtp`, `nToken` | Production-ready capability | Token and OTP behavior is module-owned and documented. Project-specific delivery channels or policies must be layered through services/configuration. |

## Data, Persistence, Import, And Export

| Capability | Owner | Current Maturity | Notes And Required Gate |
| --- | --- | --- | --- |
| Schema-driven database CRUD | `nDatabase/database`, `nService` | Production-ready capability | Model get/save/update/remove pipelines, access policy, generated services, and generated tests are covered. Provider-specific behavior stays behind database provider modules. |
| MongoDB provider | `nDatabase/mongodb`, `vMongodb` | Guarded provider | MongoDB behavior is implemented and used by the framework. Production use requires configured tenant databases, secrets, backup/restore rules, indexes, and release validation. |
| Cassandra provider | `nDatabase/cassandradb` | Placeholder or scaffold | The provider boundary exists, but projects must verify/complete provider contracts, connection handling, DAO behavior, tests, and operations before production use. |
| Elastic database provider | `nDatabase/elasticdb` | Placeholder or scaffold | Treat as a provider boundary, not a production database adapter, until the missing contracts and live tests are implemented. |
| New database provider such as Oracle | Project/provider module under database ownership | Parked future capability | Implement as a provider module with configuration, connection service, DAO behavior, schema access policy compatibility, tests, and documentation. Do not edit framework database contracts for one customer. |
| File-based import | `nData/nImport/import`, format modules | Production-ready capability | Init, core, sample, local, remote staging, diagnostics, run history, validation-only mode, checksums, retry metadata, rollback hooks, failure consolidation, and batch dispatch are covered. |
| Import format processors | `csvImport`, `excelImport`, `jsonImport`, `jsImport` | Production-ready capability | Format modules parse owned input files and feed the shared import lifecycle. Very large Excel streaming remains a future improvement. |
| Remote import staging | `nData/nImport/import` plus project/provider transport | Guarded provider | Remote import stages files first and then uses trusted active-module headers. Public production remote import remains gated until a project/provider owns source configuration, credentials, live tests, and operations. |
| Direct arbitrary remote pull from request payload | None | Parked future capability | Nodics should not accept arbitrary URLs, credentials, schemas, or operations from request payloads. Use governed source names and staged files. |
| Shared export contract | `nData/nExport/export` | Guarded provider | The default export service is intentionally fail-closed while source-backed definitions, lifecycle, format renderers, delivery providers, history, diagnostics, and production tests are designed. |
| Export format modules | `csvExport`, `excelExport`, `jsonExport`, `jsExport` | Placeholder or scaffold | Format ownership exists, but production export rendering must be completed through governed export definitions and tests. |

## Cache, Search, Messaging, Jobs, And Workflow

| Capability | Owner | Current Maturity | Notes And Required Gate |
| --- | --- | --- | --- |
| Cache framework | `nCache/cache` | Production-ready capability | Cache policy, router/item/search cache behavior, invalidation, diagnostics, and adapter selection are documented and tested. |
| Node in-memory cache | `nodeCache` | Sample or reference | Suitable for local, single-process, or non-strict behavior. Do not use as the only state store for distributed consistency requirements. |
| Redis cache provider | `redisCache` | Guarded provider | Redis-backed behavior is available for distributed cache and strict auth cache. Live Redis release gates must be explicitly configured. |
| Hazelcast cache provider | `hazelcastCache` | Placeholder or scaffold | The boundary exists, but production use requires adapter completion, health checks, distributed behavior tests, and operations documentation. |
| Search framework | `nSearch/search` | Production-ready capability | Search routes, schema/index contracts, indexing pipeline, target dispatch from import, cache policy, and generated search tests are covered. |
| Elasticsearch provider | `nSearch/elastic` | Guarded provider | Elasticsearch-compatible behavior requires configured engine endpoints, index prefixes, tenant isolation, health checks, and guarded live-provider tests. |
| EMS provider-neutral messaging | `nEms`, `emsClient`, `nEvent`, `nems` | Production-ready capability | Event and messaging contracts, NEMS routes, EMS client behavior, tenant message resolution, failed-message schema, and process flow are tested. |
| Kafka provider | `nEms/kafka` | Guarded provider | Kafka publish capability is covered deterministically. Production use requires broker configuration, topic ownership, consumer groups, retry/dead-letter policy, and guarded live tests. |
| ActiveMQ provider | `nEms/activemq` | Placeholder or scaffold | Treat as a provider boundary until live adapter behavior, operations, and tests are completed. |
| CronJob runtime | `cronjob` | Production-ready capability | Scheduler lifecycle, route contracts, runtime container ownership, event handler behavior, and logs are tested. Multi-node production scheduling still requires topology ownership and release validation. |
| Workflow and BPM lifecycle | `workflow`, `nbpm` | Production-ready capability | Workflow carrier/action/channel behavior, lifecycle pipelines, event continuation, split/retry, and generated schema routers are covered. Project workflows must add flow-specific tests. |

## Business Capability Modules

| Capability | Owner | Current Maturity | Notes And Required Gate |
| --- | --- | --- | --- |
| Profile, tenant, enterprise, users, groups | `profile` | Production-ready capability | Core identity/domain data is implemented and tested. Production setup requires governed bootstrap identities and tenant-specific data planning. |
| CMS and WCMS | `cms`, `wcms` | Production-ready capability | Content schemas, workflow content contracts, initializer/sample data, and generated tests are documented and covered. Project content models must own their renderer and workflow extensions. |
| Catalog and product information patterns | `nCatalog`, commerce modules | Production-ready capability | Catalog capability supports DaaS and product-information-center patterns. Project catalogs must define tenant/application-specific schemas, import/export, search, and workflow rules. |
| Cart and order | `cart`, `order` | Production-ready capability | Commerce schemas, routes, services, initializer/sample data, and generated tests are covered as framework business examples. |
| Quizer modules | `quizer`, `quiz`, `wquiz`, `vquiz` | Sample or reference | Useful for optional/application examples. Promote to production only after product-specific requirements, tests, and documentation are completed. |
| KYC modules | `gOptional/kyc` | Sample or reference | Optional capability structure exists. Project KYC work must define compliance rules, identity provider integration, audit, retention, and release tests. |

## Project And Topology Reference

| Capability | Owner | Current Maturity | Notes And Required Gate |
| --- | --- | --- | --- |
| Startio project | `startio` | Sample or reference | Startio is the framework validation project for end-to-end local, environment, server, node, and topology behavior. It proves structure, not customer production policy. |
| Local consolidated runtime | `monoServer` | Sample or reference | Used for development and deterministic tests. Local API exposure can enable developer/admin categories that production must disable by default. |
| Modular multi-server runtime | Startio environment/server/node modules | Guarded provider | Modular topology smoke tests prove basic communication. Production topology requires environment-owned secrets, health checks, service discovery, observability, backup, and deployment rules. |
| Production operating model | Project/environment/server/node modules | Parked future capability | The operating model still needs deployment topology, observability, audit retention, backup/restore, rollback, disaster recovery, and support diagnostics to be fully defined for a reference production project. |

## Rules For Changing Maturity

Changing a maturity level is a framework governance change. The developer or AI
tool must update this page only when the evidence changes.

To promote a capability:

- identify the owner module and provider boundary;
- implement or verify layered configuration and override paths;
- keep secrets out of source, logs, generated context, and request payloads;
- add deterministic contract tests;
- add guarded live-provider tests when an external engine is required;
- document health checks, diagnostics, rollback, and failure behavior;
- update module `README.md`, relevant `gDocs` guides, LLM contracts, and
  generated context;
- run focused tests, `npm run llm:validate`, `npm run quality:docs`, and
  `npm run release:check`.

To demote a capability:

- explain why the capability is no longer safe at the previous level;
- fail closed where runtime behavior could be unsafe;
- update public documentation and AI/developer contracts;
- add a backlog item for the missing work.

## Continue

- Business capabilities: [Business Capabilities And Outcomes](../business/business-capabilities-and-outcomes.md)
- Terminology: [Nodics Glossary](glossary.md)
- Module ownership: [Module Documentation Index](module-documentation-index.md)
- Documentation home: [Nodics Documentation](../README.md)
