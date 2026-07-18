# How To Customize And Extend Nodics

Nodics is designed so projects can customize behavior without changing released framework code.

Customization means a later project, environment, server, node, tenant, provider, or runtime layer contributes behavior through the same Nodics contracts that the framework uses. The goal is not to work around the framework. The goal is to provide a better implementation for the same capability.

## Beginner Summary

Customization is how a project changes behavior safely.

The wrong way is to edit a framework file for one customer. That makes future
framework updates harder and hides the customer rule inside out-of-box code.

The Nodics way is to add the change in a later active layer:

- project module for customer-specific behavior;
- environment module for deployment-specific behavior;
- server module for process-specific behavior;
- node module for instance-specific behavior;
- tenant/runtime configuration for governed tenant-specific behavior;
- provider module for database, cache, search, messaging, storage, email,
  payment, or infrastructure behavior.

The framework capability remains stable. The implementation changes through the
active module hierarchy.

## Customization Decision Table

| Need | Customize here | Example |
| --- | --- | --- |
| Change business rule for one customer | Project module | Customer-specific order approval rule |
| Change a value by environment | Environment `config/properties.js` | QA uses a different search endpoint |
| Change active modules or ports for one process | Server `config/properties.js` | Local runs all modules together |
| Assign scheduled work to one instance | Node configuration | Only node 1 runs a publishing job |
| Change data placement for one business | Tenant/runtime configuration | Dedicated tenant uses private database/search/cache |
| Add Oracle database support | Database provider module or project provider module | Implement provider contract without changing generic database services |
| Change route permission by project | Route override or `permissionConfig` property | Internal token permission differs by deployment |
| Change import validation for a customer | Project import service/interceptor/pipeline | Reject or transform customer-specific data |

When a user or AI tool asks for a customization, first identify the row in this
table. If no row fits, inspect the owning module docs before inventing a new
extension path.

## Customizing Or Generalizing Services

Use this pattern when a project needs to change service behavior, add a new service operation, or replace a default implementation.

The standard service rule is:

```text
Keep functions inside module.exports and keep the file under a loader-visible service path.
```

Example:

```js
module.exports = {
    createPlan: function (options) {
        return {
            executableByDefault: false,
            requiresExplicitApproval: true
        };
    }
};
```

This style lets Nodics load services through active module hierarchy and lets later modules override functions without editing the original module.

## Business And Service Extendibility

Business behavior should live in the smallest module that owns the business capability.

Use:

- a project module for customer-specific business rules;
- a provider module for database, cache, search, messaging, storage, email, payment, or infrastructure adapters;
- an environment, server, or node module for deployment-specific behavior;
- tenant or runtime configuration for governed runtime differences;
- a framework module only when the shared framework capability itself must change.

Do not place project-specific behavior into framework modules because it works for one customer. Put it in a later active module and prove the override with tests.

## Extend Existing Or Create New Service

Create a new service function when the capability needs a new behavior.

Override an existing service function when the capability contract stays the same but the implementation changes.

Before adding or overriding a service, document:

- owning module;
- function name;
- input contract;
- output contract;
- tenant behavior;
- security behavior;
- side effects;
- failure behavior;
- tests proving framework default and project override behavior.

## Minimal Service Override Example

If a framework module has:

```js
module.exports = {
    createPlan: function (options) {
        return {
            executableByDefault: false,
            requiresExplicitApproval: true
        };
    }
};
```

A later project module can provide the same service artifact and same function
name when it intentionally changes that behavior:

```js
module.exports = {
    createPlan: function (options) {
        return {
            executableByDefault: false,
            requiresExplicitApproval: true,
            customerPolicy: 'project-owned-policy'
        };
    }
};
```

The exact file path depends on the service name and owning module, but it must
remain under `src/service` so the Nodics loader can discover and merge it.
Always add tests proving the effective project behavior.

## Overriding Existing Services

A later module can override service behavior by contributing the same loader-visible service name and function contract. The override must preserve the public capability contract unless the project intentionally owns a breaking project-specific contract.

When overriding:

- keep the same function name unless the caller is also intentionally changed;
- preserve required input and output shape;
- call existing framework services when only part of the behavior changes;
- avoid direct provider access when a Nodics service contract already exists;
- update tests so both the framework default and the effective project behavior are clear.

## Common.js - Generalizing Common Processes

Shared utilities belong in loader-visible module paths such as `src/utils` or `src/service`, not in random helper folders.

Use common utilities only for behavior that is genuinely reusable across a module or module family. If a utility is customer-specific, keep it in the customer project module. If it is provider-specific, keep it in the provider module.

## Utility Middlewares

Utility middleware is reusable supporting behavior used by services, routers, pipelines, interceptors, tests, or generators.

Examples include:

- value normalization;
- status and enum lookup;
- file/path handling;
- error wrapping;
- tenant-safe helper logic;
- traceability helpers;
- request or response shaping helpers.

Utility middleware must not become a hidden source of architecture. Capability behavior still belongs to schemas, services, routers, pipelines, providers, and configuration.

## OOTB Provided Middleware

Out-of-the-box Nodics utilities provide framework-level behavior that many modules can use.

Use out-of-the-box utilities when they already express the contract. Do not duplicate utility behavior in a project just because it is shorter to copy a function. If the existing utility is not sufficient, add an override or extension in the right owner module and test it.

## Utils Generalization

Generalize utility behavior by adding or overriding utility functions through the active module hierarchy.

When a utility is generalized, check:

- whether every caller can safely accept the new behavior;
- whether the utility is tenant-aware;
- whether it logs or exposes sensitive data;
- whether provider-specific behavior has leaked into a generic utility;
- whether tests cover both the default and generalized behavior.

## Define Enumerations

Use enums when a field or behavior accepts a controlled list of values.

Enums belong in the module that owns the meaning of the values. For example, order status values belong near order behavior. CronJob state values belong near scheduled-job behavior.

Document:

- enum name;
- allowed values;
- default value;
- where the enum is used;
- how projects may add or restrict values;
- tests that prove invalid values are rejected.

## Enum Generalization

Projects can generalize enums when a later layer needs additional values.

Do not remove or rename framework enum values without checking generated APIs, schemas, tests, import/export mappings, search indexes, runtime configuration, and existing data. If a project removes a value, the effective project tests must prove that the generated behavior no longer depends on it.

## Classes Generalization

Classes and data/process holder objects should be generalized only when they are designed as extension points.

Before generalizing a class:

- identify the owning module;
- confirm which code instantiates it;
- confirm whether generated artifacts reference it;
- preserve constructor and method contracts;
- add tests for default and project-specific class behavior.

Do not create a class-based extension when a standard service function override is enough. Service overrides are usually easier for human developers and AI tools to follow.

## Generalizing Service Layer

The service layer owns business behavior. Generalize the service layer when a project needs a different implementation of the same business capability.

Good service-layer customization examples:

- project-specific pricing rules;
- customer-specific approval logic;
- different data import validation behavior;
- provider-specific integration behavior behind a stable contract;
- tenant-specific policy resolution through configuration.

Keep controllers thin. Keep provider calls behind provider modules. Keep cross-module orchestration in facades.

## Generalizing Facade Layer

The facade layer coordinates behavior across services or module boundaries.

Generalize a facade when the orchestration changes but the lower-level service capabilities remain valid. For example, a project may add approval, audit, event publication, or integration calls around a default operation.

Facade overrides must preserve:

- route/controller input expectations;
- service call order where required by the business contract;
- tenant context;
- permission and access policy behavior;
- diagnostics and failure behavior.

## Generalizing Controller Layer

Controllers map request and response concerns. Generalize a controller only when request mapping, response shape, request validation, or route-specific behavior changes.

Do not put business logic in controllers. If the business rule changes, override the service or facade. If request handling changes, document the route, controller, security, tenant, validation, and response impact.

## Generalizing Router Registration

Router registration is how modules expose APIs.

A project may add a route, override route metadata, change permissions through configurable permission keys, or move a route behind a different controller action when the owning capability allows it.

When generalizing routers:

- define the route in `src/router/routers.js`;
- keep route permission and authentication behavior explicit;
- keep login/pre-authentication routes separate from secured routes;
- update OpenAPI/docs when public APIs change;
- add tests for route registration, permissions, tenant behavior, response success, and response failure.

For a beginner: the router is only the front door. Put the URL, method,
permission, `apiExposure`, help text, controller, and operation in the router.
Put request mapping in the controller. Put orchestration in the facade. Put
business behavior in the service.

## Data Access Layer - DAO

The DAO/data access layer protects the rest of the application from provider-specific persistence behavior.

Use a DAO/provider implementation when the project needs a different database provider, query strategy, persistence optimization, or provider-specific capability. Business services should not call MongoDB, Cassandra, Oracle, Redis, or search providers directly when a Nodics service/DAO contract exists.

## Define New DAO

A new DAO function should define:

- target schema;
- provider;
- query/input contract;
- output contract;
- tenant behavior;
- transaction or consistency expectations;
- error and retry behavior;
- tests for default, provider, and failure behavior.

Put provider-specific DAO behavior in a provider module or project provider module, not in generic database code.

## Generalizing Data Access Layer

Generalize data access when a project needs to change persistence behavior while preserving the capability contract.

Examples:

- use Oracle for a customer project;
- use Cassandra for a high-volume read/write area;
- change query strategy for one schema;
- add provider-native bulk behavior behind the same service contract;
- add tenant-specific database routing.

The generic data capability remains the contract. The provider module implements the behavior.

## Platform Generated Functions

Generated functions are conveniences produced from source definitions. They are not the source of truth.

If generated behavior is wrong:

1. Find the owning schema, route, configuration, or generator contract.
2. Change the source definition.
3. Regenerate.
4. Run generated and focused tests.
5. Update documentation and LLM context.

Do not hand-edit generated files as a permanent fix.

## Common Customization Mistakes

| Mistake | Why it is risky | Correct approach |
| --- | --- | --- |
| Editing framework service for one customer | Breaks upgrade path and hides customer ownership | Add project module override |
| Adding files outside `src/service`, `src/controller`, `src/facade`, or other standard folders | Nodics loader may not see or merge the behavior | Use standard module structure |
| Changing generated code directly | Regeneration will overwrite it | Change schema, route, config, or generator source |
| Hardcoding tenant, provider, endpoint, or permission | Blocks reuse and runtime governance | Use layered configuration or tenant/runtime records |
| Putting business logic in routers/controllers | Makes behavior hard to reuse and test | Move logic to facade/service |
| Bypassing permissions because route is internal | Internal routes still need governed access | Use internal-token permissions and route metadata |

## Define Callback

Callbacks and hooks must have explicit input, output, and error behavior.

Prefer promise-based service functions or pipeline nodes when the behavior participates in a Nodics lifecycle. A callback should not hide tenant context, security behavior, diagnostics, or persistence side effects.

## Managing Distributed Systems

Nodics supports distributed systems through active modules, environment/server/node topology, remote module communication, secured internal tokens, messaging, cache providers, scheduled-job node responsibility, and diagnostics.

When a capability crosses process boundaries:

- define which server owns it;
- define how other servers call it;
- secure module-to-module access;
- keep tenant context in every request/message/job;
- decide whether cache, events, or retries are needed;
- add topology tests for consolidated and modular modes.

## Reduce Deployment Effort

Deployment becomes easier when the same source definitions describe local, modular, and production behavior.

Nodics reduces deployment effort by keeping:

- configuration in layered `properties.js`;
- active modules in server/environment definitions;
- generated artifacts reproducible from source;
- startup data idempotent;
- tests aligned with module ownership;
- runtime changes governed with audit and rollback;
- provider choices behind configuration and provider modules.
