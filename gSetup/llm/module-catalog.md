# Module Catalog

This file gives AI agents and developers a first-pass map of important Nodics module responsibilities. Verify implementation details in the module source before changing behavior.

## Framework Modules

| Module | Responsibility |
| --- | --- |
| `nDefault` | Base/default schema and foundational generated behavior. |
| `nConfig` | Startup, module hierarchy, configuration loading, clean/build, generated artifact governance. |
| `nCommon` | Shared errors, utilities, processors, promise helpers, and file helpers. Legacy copied scaffolding is retired until contract-driven generation is implemented. |
| `nDatabase` | Schema processing, model generation, database connection, DAO/generic CRUD behavior. |
| `nService` | Tenant, enterprise, status catalog, service calls, module communication, topology helpers. |
| `nPipeline` | Pipeline definition, execution, and runtime pipeline behavior. |
| `nEvent` | Event/listener infrastructure. |
| `nRouter` | API route contract, request pipeline, auth/header normalization, route execution. |
| `nController` | Common controller support. |
| `nFacade` | Common facade support. |
| `nValidator` | Validation capability and generated validator APIs. |
| `nAuth` | Authentication/authorization foundations. |
| `nSearch` | Search/indexing abstractions and generated search APIs. |
| `nCatalog` | Framework-level catalog capability foundation. |
| `nToken` | Token schema/capability support. |
| `nData` | Data import/export family root. |
| `nImport` | Import engine, formats, import diagnostics, import run history, import access policy checks. |
| `nExport` | Export engine and export access policy checks. |
| `nEms` | Event/message service clients including ActiveMQ/Kafka modules. |
| `nTest` | Nodics test framework and generated test support. |
| `nSystem` | System APIs, configuration APIs, OpenAPI contract exposure, file/log/test endpoints. |
| `nDynamo` | Runtime configuration, schema/router/class/pipeline overrides, activation/audit/rollback governance. |

## Core Business Modules

| Module | Responsibility |
| --- | --- |
| `profile` | Enterprise, tenant, user, customer, employee, user group, permission-related profile data. Often required before other business modules. |
| `nems` | Core event management capability. |
| `cronjob` | Cron job definitions, logs, and execution support. |
| `workflow` | Workflow schema/core/API capability. |
| `quizer` | Quiz-related capability group. |

## Commerce And Content Modules

| Module | Responsibility |
| --- | --- |
| `cart` | Cart capability. |
| `order` | Order, payment status, shipping status, and reason data. |
| `cms` | CMS site/page/component/type capabilities. |
| `wcms` | Web CMS extension module. |

## Data/Application Modules

| Module | Responsibility |
| --- | --- |
| `dataProcessor` | Data processing capability. |
| `dataConsumer` | External/internal data consumer capability. |
| `dataPublisher` | Data publishing capability. |
| `cres` | Marketing/review test capability in current repo. |

## Application/Test Modules

| Module | Responsibility |
| --- | --- |
| `kickoff` | Sample/test application project. It demonstrates application, environment, server, node, config, data, and tests. Do not hardcode it in framework logic. |
| `kickoffModules` | Sample application module group. |
| `kickoffEnvs` | Environment grouping folder, not a normal startup module. |
| `kickoffLocal` | Local environment/server-root module. |
| `kickoffLocalServer` | Default local consolidated server module. |

## Module Documentation Rule

When adding or significantly changing a module:

1. Update this catalog.
2. Add or update module-level documentation.
3. Explain owned schemas, routes, services, data, tests, and runtime contracts.
4. State what can be overridden by project modules.
