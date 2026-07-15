# nService

`nService` owns shared service-layer contracts used by framework and project
modules, including module communication, tenant/enterprise handling,
authentication-provider cache access, authorization helpers, and status/log
services.

Authentication token cache helpers must preserve tenant scope and avoid leaking
credential material. Invalidation callbacks may emit structured observability
and audit context such as reason code, tenant, enterprise, principal, source,
and token type, but must never log or persist bearer tokens, refresh tokens,
API keys, or auth cache keys.

## Service Model

Services are generated and handwritten business-behavior contracts that can be
generalized or overridden by later modules. Services own behavior, facades
orchestrate services, controllers map requests, and routers declare HTTP/access
contracts.

## Capability

`nService` provides:

- generated schema service templates for get, get by id, get by code, save, save all, update, remove, remove by id, and remove by code;
- generated service artifacts under `src/service/gen`;
- module-to-module and external HTTP request helpers;
- standard header normalization for authorization, API key, and enterprise context;
- authentication provider services for user login and internal module access;
- authorization provider services;
- API key service behavior;
- tenant and enterprise handler services;
- status definition lookup;
- logging service wrappers;
- module, node, and module-configuration library objects.

Generated services delegate schema CRUD behavior into pipeline contracts. Handwritten services own business behavior that should not live in controllers, facades, routers, or generated artifacts.

## Runtime Flow

1. A router maps an HTTP operation to a controller.
2. The controller normalizes request parameters, query, headers, and body into Nodics request context.
3. The facade coordinates the operation and calls the owning service.
4. A generated service resolves the schema model from module and tenant context.
5. The service starts the relevant pipeline, such as get, save, update, or remove.
6. Database, validation, interceptor, audit, cache, and diagnostics behavior runs through the pipeline.

For module-to-module calls, `DefaultModuleService` builds governed request options, normalizes headers, delegates URL resolution to the router service, executes the request, and enriches failures with sanitized context.

## Configuration And Security

Service behavior must be driven by active modules, layered configuration, tenant context, schemas, pipelines, and runtime governance.

Do not hardcode:

- credentials;
- bearer tokens;
- API keys;
- tenant mappings;
- enterprise mappings;
- remote module URLs;
- permission decisions;
- customer-specific business rules.

Authentication token cache helpers must preserve tenant scope and avoid leaking credential material. Invalidation callbacks may emit structured observability and audit context such as reason code, tenant, enterprise, principal, source, and token type, but must never log or persist bearer tokens, refresh tokens, API keys, or auth cache keys.

## Override Path

Project modules may override service behavior by contributing same-name service files through later active modules. The overriding service must preserve the published capability contract unless the project also updates the router/facade/schema/tests/docs that expose the new contract.

Use this layer when the change owns business behavior, data mutation, runtime policy, integration behavior, or reusable domain logic. Keep controllers thin and keep facades focused on orchestration.

## Extension Contract

Project modules may add or replace services through the module hierarchy. New
service behavior must document configuration, tenant/request context, generated
artifacts affected, downstream dependencies, errors, diagnostics, and tests for
both default behavior and later-module overrides.

## Tests

Run focused service coverage with:

```bash
node gFramework/nService/test/authTokenInvalidationService.test.js
node gFramework/nService/test/moduleRequestHeaderNormalization.test.js
node gFramework/nService/test/statusDefinitionCatalog.test.js
npm run quality:docs
```

## What To Avoid

Avoid:

- placing business behavior in controllers when it belongs in services;
- editing generated service artifacts manually instead of changing source definitions and regenerating;
- bypassing tenant context when resolving schema models;
- using direct HTTP clients outside `DefaultModuleService` for module communication;
- logging tokens, API keys, auth cache keys, or credentials;
- adding service files outside `src/service`, where the Nodics loader will not discover them consistently.
