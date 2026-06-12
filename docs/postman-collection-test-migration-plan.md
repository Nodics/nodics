# Postman Collection Test Migration Plan

This note summarizes `docs/Nodics.postman_collection.json` as a historical capability map and records how those checks should be migrated into Nodics' module-owned test framework.

The Postman collection is not just a set of API samples. It captures platform behavior that should become reusable, hierarchy-aware tests. Tests should live with the module or framework capability they validate, not inside a sample project unless the behavior is truly sample-project-specific.

## Collection Inventory

- Total requests: 188
- Total folders: 34
- Methods:
  - GET: 67
  - POST: 60
  - PUT: 44
  - DELETE: 11
  - PATCH: 6
- Requests with body: 122
- Variables:
  - `contextName=grayframes`
  - `appVersion=v0`
- Ports used:
  - `3000` for consolidated/default runtime
  - `3002`, `3004`, `3008`, `3010`, `3014` for modular or server-specific checks

## Module-Wise Test Coverage

## Current Migrated Route Contracts

The first Postman migration slice validates fast, module-owned route contracts without requiring MongoDB, Kafka, Redis, or a running Nodics server. These tests protect the API surface that the collection exercised while deeper behavior tests are added gradually.

- `gCore/profile/test/profileRouteContract.test.js`
- `gCore/cronjob/test/cronJobRouteContract.test.js`
- `gFramework/nSystem/test/systemRouteContract.test.js`
- `gFramework/nEms/emsClient/test/emsClientRouteContract.test.js`
- `gCore/workflow/flowApi/test/workflowRouteContract.test.js`
- `gFramework/nSearch/search/test/searchRouteContract.test.js`
- `gFramework/nDynamo/test/dynamoRouteContract.test.js`

Run with `npm run test:route-contracts`. This suite is also included in `npm run test:basic`.

The route contract runner discovers `*RouteContract.test.js` files from module-owned `test` folders. This keeps the command open for project-specific modules: a project can add its own route contract tests without modifying Nodics package scripts.

Capability behavior tests use marker-based discovery. Add `@nodics-capability-behavior` to a module-owned `.test.js` file and tag it with `@nodics-area <area>`, such as `@nodics-area system` or `@nodics-area profile`. This lets project-specific modules add behavior coverage without changing Nodics package scripts.

Run all migrated behavior tests with `npm run test:capability-behavior`, or one area with `node scripts/run-capability-behavior-tests.js --area=<area>`.

### CronJobs

Current collection coverage: 22 requests.

- Create job
- Run job
- Start, stop, pause, resume, and remove job
- CronJob model CRUD
- Save-or-update cronJob
- Cross-port cronJob checks for modular runtime

Target Nodics tests:

- `gCore/cronjob/test/cronJobLifecycle.test.js`
- `gCore/cronjob/test/cronJobCrud.test.js`
- `gCore/cronjob/test/cronJobTopology.test.js`

### Events And NEMS

Current collection coverage: 5 requests.

- Cronjob event handling
- Profile event handling
- NEMS event create/process/update

Target Nodics tests:

- `gFramework/nEvent/test/eventDispatch.test.js`
- `gCore/nems/test/nemsEventProcessing.test.js`
- Integration coverage in topology tests when event-dependent modules are active.

### Profile

Current collection coverage: 29 requests.

- Address CRUD
- Enterprise CRUD
- Tenant create/get/delete
- Employee/customer APIs
- Employee/customer authentication
- API key and user group checks
- Context/versioned URLs through `{{contextName}}/{{appVersion}}`

Target Nodics tests:

- `gCore/profile/test/addressCrud.test.js`
- `gCore/profile/test/enterpriseCrud.test.js`
- `gCore/profile/test/tenantCrud.test.js`
- `gCore/profile/test/authentication.test.js`
- `gCore/profile/test/userGroupAuthorization.test.js`

Current migrated behavior tests:

- `gCore/profile/test/profileControllerRequestMapping.test.js`
- `gCore/profile/test/enterpriseServiceCapabilityBehavior.test.js`
- `gCore/profile/test/initRequiredFlag.test.js`
- `gCore/profile/test/profileInitRequiredDetection.test.js`

Open Profile findings:

- `/profile/token/authorize` route resolution is fixed with `DefaultAuthorizationProviderController.authorizeToken`, delegating to `DefaultAuthorizationProviderService`.

### EMS

Current collection coverage: 8 requests.

- Publish through data consumer or EMS client
- Publish to Kafka
- Register publisher
- Close publisher
- Register consumer
- Close consumer
- Modular consumer/publisher checks through ports such as `3002` and `3014`

Current migrated tests:

- `gFramework/nEms/emsClient/test/messageTenantResolution.test.js`
- `gFramework/nEms/emsClient/test/activeEmsPublisher.test.js`

Target additional tests:

- Active consumer registration
- Consumer close/reopen lifecycle
- Kafka and ActiveMQ parity where both clients are enabled
- Failed-message handling with tenant context

### System

Current collection coverage: 14 requests.

- Import sample, core, local, and init data
- Run UTest and NTest
- Generate API key
- Change log level
- Ping NEMS/system endpoint
- File download
- Runtime config update
- Workflow-to-schema association

Target Nodics tests:

- `gFramework/nSystem/test/systemImportEndpoints.test.js`
- `gFramework/nSystem/test/systemTestRunnerEndpoints.test.js`
- `gFramework/nSystem/test/logLevelRuntimeUpdate.test.js`
- `gFramework/nSystem/test/fileDownload.test.js`

Current migrated behavior tests:

- `gFramework/nSystem/test/systemFileService.test.js`
- `gFramework/nData/nImport/import/test/systemImportControllerRequestMapping.test.js`
- `gFramework/nController/test/logControllerRequestMapping.test.js`
- `gFramework/nTest/test/testExecutionControllerRequestMapping.test.js`
- `gFramework/nDatabase/database/test/schemaIndexControllerRequestMapping.test.js`
- `gFramework/nSystem/test/systemConfigurationCapabilityBehavior.test.js`
- `gFramework/nData/nExport/export/test/dataExportCapabilityBehavior.test.js`

Open System findings:

- `/system/export` route resolution is fixed with `DataExportController`, `DataExportFacade`, and `DataExportService`. The default service fails with a clear not-configured error until a project or framework module provides real export behavior.

### Cache

Current collection coverage: 13 requests.

- Item cache get/set/flush
- API cache get/set/flush
- Flush by key
- Flush by prefix
- Profile and cronjob cache use cases

Target Nodics tests:

- `gFramework/nCache/cache/test/itemCacheLifecycle.test.js`
- `gFramework/nCache/cache/test/apiCacheLifecycle.test.js`
- `gFramework/nCache/cache/test/cacheFlushByKeyAndPrefix.test.js`

### Search

Current collection coverage: 25 requests.

- Search schema create/get/update
- Indexer create/update/get
- Full and incremental indexing
- Search health
- Search CRUD
- Exists by id
- Refresh
- Delete type/index/model

Target Nodics tests:

- `gFramework/nSearch/search/test/searchSchemaLifecycle.test.js`
- `gFramework/nSearch/search/test/searchIndexerLifecycle.test.js`
- `gFramework/nSearch/search/test/searchDocumentLifecycle.test.js`
- `gFramework/nSearch/search/test/searchHealthAndRefresh.test.js`

### Dynamo

Current collection coverage: 9 requests.

- Dynamic class update
- Router configuration update
- Schema configuration update
- Class snapshot
- Dynamic class execution
- Temporary schema lookup

Target Nodics tests:

- `gFramework/nDynamo/test/dynamicClassUpdate.test.js`
- `gFramework/nDynamo/test/dynamicRouterConfiguration.test.js`
- `gFramework/nDynamo/test/dynamicSchemaConfiguration.test.js`
- `gFramework/nDynamo/test/dynamicClassSnapshotAndExecute.test.js`

### Workflow

Current collection coverage: 38 requests.

- Carrier init/update/release
- Auto workflow
- Manual workflow
- Mixed workflow
- Multi workflow
- Action processing
- Workflow chain lookup
- Workflow carrier lookup
- Workflow carrier/item archival
- Workflow item pause/resume
- Carrier block/release/pause/resume
- Workflow creator/approver authentication

Target Nodics tests:

- `gCore/workflow/test/workflowCarrierLifecycle.test.js`
- `gCore/workflow/test/autoWorkflow.test.js`
- `gCore/workflow/test/manualWorkflow.test.js`
- `gCore/workflow/test/mixedWorkflow.test.js`
- `gCore/workflow/test/multiWorkflow.test.js`
- `gCore/workflow/test/workflowActionProcessing.test.js`
- `gCore/workflow/test/workflowPauseResumeBlockRelease.test.js`

### Data Consumer

Current collection coverage: 2 requests.

- Internal data save/update

Target Nodics tests:

- `gDeap/dataConsumer/test/internalDataProcessing.test.js`

### Validators And Indexes

Current collection coverage:

- `validators`: 2 requests
- `validator`: 1 request
- `indexes`: 3 requests

Target Nodics tests:

- `gFramework/nValidator/test/validatorCrud.test.js`
- `gFramework/nValidator/test/schemaValidatorLookup.test.js`
- `gFramework/nDynamo/test/schemaIndexLookup.test.js`

### Catalog

Current collection coverage: 2 requests.

- Catalog get
- Catalog create

Target Nodics tests:

- `gFramework/nCatalog/test/catalogCrud.test.js`

### CMS

Current collection coverage: 3 requests.

- CMS page get by code
- CMS page update
- CMS page create

Target Nodics tests:

- `gContent/cms/test/cmsPageCrud.test.js`

### OTP

Current collection coverage: 4 requests.

- OTP get
- OTP generate
- OTP validate
- OTP update

Target Nodics tests:

- `gFramework/nOtp/test/otpLifecycle.test.js`

### CRES

Current collection coverage: 3 requests.

- Review create/update
- Review delete
- Review get

Target Nodics tests:

- `gMrkty/cres/test/reviewCrud.test.js`

### DaaS

Current collection coverage: 3 requests.

- Authenticate
- DaaS core ping
- DaaS API check

Target Nodics tests:

- Keep pending until DaaS module ownership and active module status are confirmed.

## Migration Strategy

1. Preserve the Postman collection as historical evidence until equivalent tests exist.
2. Build reusable module-owned tests first, starting with framework capabilities.
3. Keep integration tests configurable through server/node/environment, not hardcoded to `kickoff`.
4. Use `kickoffLocalServer` only as the default sample runtime for this repository.
5. Add modular/topology variants for capabilities that rely on inter-module communication.
6. Refactor the Postman collection after APIs stabilize, using the migrated tests as the source of truth.

## Module Migration Order

This is the working order for migrating the remaining Postman coverage into Nodics tests. The order is dependency-aware: foundational platform modules come first, then core application capabilities, then optional/project-specific modules.

| Order | Module/Area | Owner | Current Route Contract | Next Test Layer |
| --- | --- | --- | --- | --- |
| 1 | System import/export/test runner/config/log/file APIs | `gFramework/nSystem` | Done | Endpoint behavior and import/export integration |
| 2 | Profile bootstrap, tenant, enterprise, auth, user groups | `gCore/profile` | Done | CRUD, auth, token, tenant isolation |
| 3 | Router/schema-driven CRUD surface | `gFramework/nRouter`, generated module routers | Partial | Effective runtime route generation after hierarchy loading |
| 4 | Data import/export processing | `gFramework/nData` | Not route-focused | Init/core/sample/local/remote behavior |
| 5 | Cache | `gFramework/nCache/cache` | No explicit routes yet | Item/API cache lifecycle and flush behavior |
| 6 | EMS and events | `gFramework/nEms/emsClient`, `gFramework/nEvent`, `gCore/nems` | EMS route contract done | Publish, consume, register, close, tenant failure paths |
| 7 | CronJob | `gCore/cronjob` | Done | Job create/update/run/start/stop/pause/resume/remove behavior |
| 8 | Search | `gFramework/nSearch/search` | Done | Schema, indexer, document, health, refresh lifecycle |
| 9 | Dynamo runtime customization | `gFramework/nDynamo` | Done | Dynamic class/router/schema update and rollback behavior |
| 10 | Workflow | `gCore/workflow` | Done | Carrier/action lifecycle and workflow variants |
| 11 | Validator and indexes | `gFramework/nValidator`, `gFramework/nDynamo` | Not complete | Validator CRUD and schema/index lookup |
| 12 | Catalog | `gFramework/nCatalog` | Not complete | Catalog CRUD |
| 13 | OTP | `gFramework/nOtp` | Not complete | OTP generate/get/validate/update |
| 14 | Catalog/CMS/content modules | Project/content modules | Conditional | Only when active in the loaded project hierarchy |
| 15 | CRES, DaaS, project-specific APIs | Project modules | Conditional | Migrate only in owning project/module tests |
| 16 | Consolidated topology | Selected server, default `kickoffLocalServer` in this repo | Started | Full API smoke through one process |
| 17 | Modular topology | Selected server/node set | Started | Profile-first and distributed inter-module API/event checks |

Rules for each module migration:

- Keep tests in the owning module's `test` folder.
- Prefer discovery-based test commands over hardcoded module lists.
- Test baseline module contracts separately from effective runtime contracts after layered overrides.
- Use `kickoffLocalServer` only as this repository's default sample runtime.
- Make tenant, environment, server, and node configurable through properties or environment variables.
- Mark tests requiring MongoDB, Kafka, Redis, Elasticsearch, or other external services as integration/full tests, not basic tests.

## Proposed Test Commands

Current commands already started:

- `npm run test:basic`
- `npm run test:full`
- `npm run test:import`
- `npm run test:ems`
- `npm run test:ems-publish`
- `npm run test:topology`

Recommended future commands:

- `npm run test:cronjob`
- `npm run test:profile`
- `npm run test:system`
- `npm run test:cache`
- `npm run test:search`
- `npm run test:dynamo`
- `npm run test:workflow`
- `npm run test:catalog`
- `npm run test:cms`
- `npm run test:otp`
- `npm run test:integration`
- `npm run test:integration:modular`

## Postman Refactor Rules

When we refactor `docs/Nodics.postman_collection.json`, apply these rules:

- Replace stale project names such as `grayframes` with variables.
- Keep context/version configurable.
- Remove hardcoded object IDs where possible.
- Separate folders by module and capability, not by ad hoc experimentation.
- Add environment variables for server ports and auth tokens.
- Align endpoint paths with refactored Nodics route behavior.
- Mark external dependency folders, such as Kafka and ActiveMQ, as integration-only.
- Keep modular-runtime requests grouped separately from consolidated-runtime requests.
