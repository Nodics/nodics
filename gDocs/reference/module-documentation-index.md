# Module Documentation Index

This page helps you move from task-based documentation in `gDocs` to the
capability-specific documentation owned by each Nodics module.

Use `gDocs` when you want to understand a feature from the user or application
developer perspective. Use module `README.md` files when you need exact source
definitions, extension points, services, routers, schemas, pipelines,
configuration, tests, and module-owned behavior.

Use the [Provider And Capability Maturity Matrix](provider-capability-maturity-matrix.md)
before selecting a provider or external adapter. It shows whether a capability
is production-ready, guarded, sample/reference, scaffolded, or parked for later
work.

This page is a task-oriented capability map. Use the
[Complete Module Catalog](module-catalog.md) when you need to find every
package-defined module, including application, environment, server, and node
composition modules that are not appropriate in a short capability map.

## How To Use This Index

1. Start with the task guide that matches what you want to do.
2. Use this index to find the owning capability module.
3. Read the module `README.md` for the exact implementation contract.
4. Read the module `docs/` pages when the capability has deeper framework
   guides.
5. Use `gSetup/llm` and `AGENTS.md` when you are changing code and need
   AI/developer implementation contracts.

## How To Read A Module README

Module documentation is more detailed than public task guides because it tells
you exactly how one capability works. When reading a module README, look for
answers to these beginner questions:

| Question | Why it matters |
| --- | --- |
| What capability does this module own? | Prevents code from being added to the wrong module. |
| Which schemas, routes, services, facades, controllers, pipelines, interceptors, events, data, and tests does it own? | Shows which layer should receive the change. |
| Which configuration values belong to this module? | Keeps policy and provider choices out of hardcoded services. |
| How can a project override or extend the behavior? | Protects framework immutability and customer customization. |
| Which generated artifacts depend on this module? | Shows when to run build, generated tests, OpenAPI, or LLM generation. |
| Which tests prove the default and override behavior? | Gives developers and AI tools a verification path. |

If a module README does not answer these questions clearly enough, update the
module README as part of the change. Do not make a beginner or AI tool infer
the extension path from source code alone.

## Core Platform And Startup

| Capability | Module Documentation | Use When |
| --- | --- | --- |
| Framework organization | [gFramework](../../gFramework/README.md) | You need the framework-level capability map. |
| Startup, module loading, generation, configuration build | [nConfig](../../gFramework/nConfig/README.md) | You need to understand bootstrap, loaders, generated artifacts, clean/build, or configuration assembly. |
| Shared utilities, errors, processors, traceability | [nCommon](../../gFramework/nCommon/README.md) | You need shared error handling, utility behavior, processor execution, or common contracts. |
| Default module scaffold and baseline contracts | [nDefault](../../gFramework/nDefault/README.md) | You need the baseline module shape used by generated or default modules. |
| Tooling, quality gates, generated context | [nTooling](../../gFramework/nTooling/README.md) | You need commands, governance reports, documentation coverage, or LLM context generation. |
| Test execution and generated test contracts | [nTest](../../gFramework/nTest/README.md) | You need testing conventions, generated tests, or effective-contract validation. |

## API, Request, And Service Layer

| Capability | Module Documentation | Use When |
| --- | --- | --- |
| API routes, Express binding, request pipeline, security, OpenAPI, Swagger UI | [nRouter](../../gFramework/nRouter/README.md), [Router Framework](../../gFramework/nRouter/docs/router-framework.md), and [nSystem](../../gFramework/nSystem/README.md) | You need to create, secure, expose, customize, document, or debug APIs. |
| Controller boundary and request mapping | [nController](../../gFramework/nController/README.md) | You need to map HTTP params, query, body, or headers into Nodics request context. |
| Facade orchestration boundary | [nFacade](../../gFramework/nFacade/README.md) | You need to coordinate services or capability calls without putting orchestration in controllers. |
| Service behavior and generated service contracts | [nService](../../gFramework/nService/README.md) | You need business behavior, generated CRUD service flow, or service override rules. |
| Version-aware service routing | [vService](../../gFramework/nService/vService/README.md) | You need versioned data/service behavior or publish-ready lifecycle behavior. |

## Data, Persistence, Import, And Export

| Capability | Module Documentation | Use When |
| --- | --- | --- |
| Database capability group | [nDatabase](../../gFramework/nDatabase/README.md) | You need database provider contracts and data access ownership. |
| Generic database lifecycle | [database](../../gFramework/nDatabase/database/README.md) | You need generated model get/save/update/remove pipelines, schema access policy, DAO cache, or CRUD behavior. |
| MongoDB provider | [mongodb](../../gFramework/nDatabase/mongodb/README.md) | You need MongoDB connection, model, or provider behavior. |
| Cassandra provider | [cassandradb](../../gFramework/nDatabase/cassandradb/README.md) | You need Cassandra-specific provider behavior. |
| Import/export capability group | [nData](../../gFramework/nData/README.md) | You need platform data movement, import/export ownership, or DaaS patterns. |
| Shared data processing | [dataCore](../../gFramework/nData/dataCore/README.md) | You need schema data handling, processors, validators, or data processing flow. |
| Import capability | [nImport](../../gFramework/nData/nImport/README.md) | You need file/API import behavior, import definitions, import diagnostics, or format processors. |
| Export capability | [nExport](../../gFramework/nData/nExport/README.md) | You need outbound feed/export contracts or target-system delivery. |

## Pipelines, Events, Messaging, And Jobs

| Capability | Module Documentation | Use When |
| --- | --- | --- |
| Pipeline framework | [nPipeline](../../gFramework/nPipeline/README.md) and [Pipeline Framework](../../gFramework/nPipeline/docs/pipeline-framework.md) | You need ordered lifecycle execution, custom pipeline nodes, processors vs pipeline nodes, or pipeline overrides. |
| Events | [nEvent](../../gFramework/nEvent/README.md) | You need module event definitions, listeners, or internal event behavior. |
| Enterprise messaging | [nEms](../../gFramework/nEms/README.md) | You need messaging abstractions, producer/consumer behavior, or provider-neutral messaging. |
| ActiveMQ provider | [activemq](../../gFramework/nEms/activemq/README.md) | You need ActiveMQ-specific messaging behavior. |
| Kafka provider | [kafka](../../gFramework/nEms/kafka/README.md) | You need Kafka-specific messaging behavior. |
| EMS client | [emsClient](../../gFramework/nEms/emsClient/README.md) | You need consumed message processing or client-side messaging behavior. |
| Workflow/BPM | [nbpm](../../gFramework/nbpm/README.md) | You need workflow lifecycle pipelines, carriers, actions, channels, and stateful business process behavior. |

## Cache, Search, Runtime Governance, And Security

| Capability | Module Documentation | Use When |
| --- | --- | --- |
| Cache capability group | [nCache](../../gFramework/nCache/README.md) | You need cache contracts, isolation, provider selection, or invalidation behavior. |
| Generic cache behavior | [cache](../../gFramework/nCache/cache/README.md) | You need framework cache services and policy behavior. |
| Redis cache provider | [redisCache](../../gFramework/nCache/redisCache/README.md) | You need Redis-backed cache behavior. |
| Node cache provider | [nodeCache](../../gFramework/nCache/nodeCache/README.md) | You need local in-memory cache behavior. |
| Hazelcast cache provider | [hazelcastCache](../../gFramework/nCache/hazelcastCache/README.md) | You need Hazelcast-backed distributed cache behavior. |
| Search capability group | [nSearch](../../gFramework/nSearch/README.md) | You need search capability ownership, provider contracts, indexing, or search API behavior. |
| Generic search behavior | [search](../../gFramework/nSearch/search/README.md) | You need search pipelines, index definitions, query behavior, indexing, cache, or search tests. |
| Elasticsearch provider | [elastic](../../gFramework/nSearch/elastic/README.md) | You need Elasticsearch-specific connection and provider behavior. |
| Runtime governance | [nDynamo](../../gFramework/nDynamo/README.md) | You need runtime configuration, schema/router/class/pipeline governance, preview, activation, audit, or rollback. |
| Authentication | [nAuth](../../gFramework/nAuth/README.md) | You need authentication contracts or auth module behavior. |
| Token lifecycle | [nToken](../../gFramework/nToken/README.md) | You need generic token generation, validation, or token lifecycle behavior. |
| One-time password | [nOtp](../../gFramework/nOtp/README.md) | You need OTP behavior built on token capability. |
| Validation | [nValidator](../../gFramework/nValidator/README.md) | You need validator definitions, runtime validator loading, or validator update pipelines. |

## Business And Domain Capabilities

| Capability | Module Documentation | Use When |
| --- | --- | --- |
| Catalogs | [nCatalog](../../gFramework/nCatalog/README.md) | You need catalog modeling, catalog hierarchy, or product/content catalog behavior. |
| Publishing | [nPublish](../../gFramework/nPublish/README.md) | You need publish lifecycle support. |
| System capability | [nSystem](../../gFramework/nSystem/README.md) | You need system-level schemas, utilities, or platform records. |
| Network/module management | [nNms](../../gFramework/nNms/README.md) | You need node/module/network management behavior. |

## How Guides Link To Modules

Use this quick map from common `gDocs` pages to module references.

| User Guide | Related Modules |
| --- | --- |
| [How To Create APIs](../development/how-to-create-apis.md) | [nRouter](../../gFramework/nRouter/README.md), [Router Framework](../../gFramework/nRouter/docs/router-framework.md), [nController](../../gFramework/nController/README.md), [nFacade](../../gFramework/nFacade/README.md), [nService](../../gFramework/nService/README.md) |
| [How To Work With Data](../data/how-to-work-with-data.md) | [nDatabase](../../gFramework/nDatabase/README.md), [database](../../gFramework/nDatabase/database/README.md), [nData](../../gFramework/nData/README.md), [nImport](../../gFramework/nData/nImport/README.md), [nExport](../../gFramework/nData/nExport/README.md), [nSearch](../../gFramework/nSearch/README.md) |
| [How Platform Capabilities Work](../platform/how-platform-capabilities-work.md) | [nPipeline](../../gFramework/nPipeline/README.md), [Pipeline Framework](../../gFramework/nPipeline/docs/pipeline-framework.md), [nCache](../../gFramework/nCache/README.md), [nEms](../../gFramework/nEms/README.md), [nEvent](../../gFramework/nEvent/README.md), [nDynamo](../../gFramework/nDynamo/README.md) |
| [How Cache Works](../platform/how-cache-works.md) | [nCache](../../gFramework/nCache/README.md), [cache](../../gFramework/nCache/cache/README.md), [redisCache](../../gFramework/nCache/redisCache/README.md), [nodeCache](../../gFramework/nCache/nodeCache/README.md), [hazelcastCache](../../gFramework/nCache/hazelcastCache/README.md), [nRouter](../../gFramework/nRouter/README.md), [database](../../gFramework/nDatabase/database/README.md), [search](../../gFramework/nSearch/search/README.md) |
| [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md) | [nAuth](../../gFramework/nAuth/README.md), [nToken](../../gFramework/nToken/README.md), [nOtp](../../gFramework/nOtp/README.md), [nRouter](../../gFramework/nRouter/README.md), [nDynamo](../../gFramework/nDynamo/README.md) |
| [How To Test Nodics Changes](../testing/how-to-test-nodics-changes.md) | [nTest](../../gFramework/nTest/README.md), [nTooling](../../gFramework/nTooling/README.md), module-specific test sections |
| [How Configuration Works](../configuration/how-configuration-works.md) | [nConfig](../../gFramework/nConfig/README.md), [nDynamo](../../gFramework/nDynamo/README.md), [nTooling](../../gFramework/nTooling/README.md) |

## Documentation Ownership Rule

If a page explains how a user performs a task, it belongs in `gDocs`.

If a page explains the exact behavior owned by one module, it belongs in that
module's `README.md` or `docs/` folder.

If a page defines rules that AI tools and developers must follow while changing
code, it belongs in `AGENTS.md` or `gSetup/llm`.

## Continue

- Complete inventory: [Complete Module Catalog](module-catalog.md)
- Terminology: [Nodics Glossary](glossary.md)
- Documentation home: [Nodics Documentation](../README.md)
