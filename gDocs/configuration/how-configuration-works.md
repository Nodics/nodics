# How Configuration Works

Configuration tells Nodics how to run.

It controls active modules, ports, database connections, cache settings, security rules, import behavior, runtime governance, and many other platform features.

If you are new to Nodics, think of configuration as the place where you answer
"how should this capability behave in this project, environment, server, node,
or tenant?" Configuration should not contain business logic. It should contain
values, switches, provider choices, limits, permissions, paths, topology, and
policy defaults that code can read.

## Beginner Summary

Use configuration when the answer may change without rewriting business code.

Good configuration examples:

- enable or disable a feature;
- choose MongoDB, Cassandra, Redis, Elasticsearch, Kafka, or another provider;
- define a server port;
- define which modules are active in a server;
- define a route permission that may differ by project;
- define import paths, batch sizes, cache TTL, or retry counts;
- define tenant-specific data placement.

Poor configuration examples:

- "calculate discount" business logic;
- a hardcoded customer rule that belongs in a project service;
- a database query that belongs in a DAO/provider service;
- a one-time script hidden in a property file.

The simple rule is:

```text
Configuration decides policy and placement. Services execute behavior.
```

## Why Configuration Is Layered

Different projects and environments need different behavior.

For example:

- Local development may use a local database.
- UAT may use shared test infrastructure.
- Production may use stricter security and separate servers.
- One tenant may need a feature enabled.
- Another tenant may need the same feature disabled.

Nodics supports this through layered configuration instead of hard-coded values.

## Common Configuration Layers

Configuration can come from:

1. Framework defaults.
2. Active modules.
3. Project modules.
4. Environment configuration.
5. Server configuration.
6. Node configuration.
7. Tenant configuration.
8. Runtime persisted configuration.

Later layers can refine earlier defaults when the contract allows it.

## How To Add Configuration

Use module or project configuration when a value belongs to source-controlled behavior.

Use environment, server, or node configuration when the value depends on where the application runs.

Use tenant or runtime configuration when the value must change per tenant or through governed runtime operations.

Do not hide configuration inside service code when it is a policy, endpoint, permission, or environment-specific value.

## Where To Put Configuration

Use this table before creating or changing a value:

| Need | Put it here | Why |
| --- | --- | --- |
| Framework default behavior | Owning framework module `config/properties.js` | The framework owns the default contract. |
| Project-wide behavior | Project or project module `config/properties.js` | The customer application owns the value. |
| Local, dev, QA, UAT, pre-prod, prod differences | Environment module `config/properties.js` | The value changes by deployment environment. |
| Process-specific ports or active modules | Server module `config/properties.js` | The runnable process owns its composition. |
| Instance-specific behavior | Node module `config/properties.js` | One node can have a different responsibility. |
| Tenant data placement or tenant policy | Tenant records or governed runtime configuration | The tenant decides data and runtime isolation. |
| Values changed after deployment with approval | Runtime configuration | The value needs preview, approval, audit, and rollback. |
| Secret values | External secret manager or environment-specific secure source | Secrets should not live in source-controlled files. |

If you are unsure, start with the module that owns the capability and then move
later in the hierarchy only when the value must vary by project, environment,
server, node, or tenant.

## Configuration Files

Every module boundary uses the same configuration entrypoints:

- `config/properties.js` for configurable values, policy defaults, command declarations, discovery rules, provider defaults, and governance data.
- `config/prescripts.js` for pre-startup extension declarations.
- `config/postscripts.js` for post-startup extension declarations.

Keep configuration in `properties.js` unless a separate artifact has a real loader, schema, generator, or external-source contract. Do not create one-off configuration files just because a property section is large.

## Package Metadata Is Not Runtime Configuration

`package.json` identifies the module. It describes name, version, load order, dependencies, ownership, runtime flags, and Nodics metadata.

Do not put environment-specific values, secrets, server ports, credentials, or active module lists into `package.json`.

Use `package.json.nodics` to classify the boundary:

- project;
- group;
- capability;
- server;
- node;
- provider or specialized module kind where already defined.

Use layered `properties.js` for values that can change by project, environment, server, node, tenant, or runtime governance.

## Configuration Loading

Nodics builds effective configuration from active modules and selected topology.

The general flow is:

1. Read module metadata.
2. Resolve the selected project, environment, server, and node.
3. Resolve active module groups and modules.
4. Load framework defaults.
5. Merge later module and project properties.
6. Apply environment, server, and node refinements.
7. Apply tenant or governed runtime configuration where applicable.

Later layers can override earlier values only through the supported contract. If a value must be overrideable, keep it in configuration or a replaceable service, not as a hardcoded constant.

## Example: Adding A Feature Flag

Use a clear property name:

```js
module.exports = {
    feature: {
        sampleFeature: {
            enabled: true
        }
    }
};
```

Then read the property through the configuration service used by the owning module.

Also document:

- What the flag does.
- Default value.
- Who can change it.
- Whether it can vary by tenant.
- Which tests prove both enabled and disabled behavior.

Example service usage:

```js
module.exports = {
    isSampleFeatureEnabled: function () {
        return CONFIG.get('feature.sampleFeature.enabled') === true;
    }
};
```

Keep the service readable. The service asks configuration for the value, but the
business behavior still lives in the service or facade that owns the feature.

## Example: Route Permission Configuration

Routes do not rely on hidden controller checks only.

When a route needs permission, define route permission behavior through the route configuration contract. This makes the behavior visible to developers, tests, OpenAPI generation, and security review.

Document:

- Which route is protected.
- Which permission is required.
- Whether the route is pre-authentication.
- Whether service-to-service access is allowed.
- Which tests cover the route.

## Runtime Configuration

Runtime configuration is configuration that can be previewed, requested, approved, activated, audited, and rolled back without editing source files.

Use runtime configuration when business or operations teams need controlled changes after deployment.

Some platform capabilities also expose operational controls. For example, cache flush and cache configuration routes can apply scoped, secured cache changes to active nodes through cache events. Those operational controls are not the same as governed persisted runtime configuration. Use `nDynamo` runtime configuration when the change needs preview, approval, audit, rollback, or durable business ownership.

Runtime configuration never bypasses:

- Validation.
- Approval rules.
- Permission checks.
- Audit.
- Rollback.
- Diagnostics.

Runtime configuration is not a replacement for source-controlled architecture. Use it for governed operational or tenant-specific changes. Use source definitions and module configuration for behavior that must be versioned, tested, and released with code.

## What To Avoid

Avoid:

- Copying the same configuration into many places.
- Creating new configuration files outside the standard configuration path.
- Hard-coding environment values in services.
- Putting secrets in source-controlled files.
- Changing framework defaults for one customer.
- Using runtime configuration for behavior that belongs in source-controlled and tested definitions.

## Beginner Troubleshooting

| Problem | Likely cause | What to check |
| --- | --- | --- |
| Value does not change | A later layer overrides it | Check project, environment, server, node, tenant, and runtime values. |
| Local works but another environment fails | Environment or server configuration differs | Compare selected environment/server `properties.js`. |
| Route permission is not respected | Route uses another permission or `permissionConfig` path | Check route metadata and auth permission catalog. |
| Provider connects to wrong endpoint | Provider config was hardcoded or overridden | Check provider module and environment/server properties. |
| AI tool added a new config file | File is outside the standard loader path | Move values to `config/properties.js` unless a real loader contract exists. |

## How To Verify Configuration Changes

Run focused tests where available.

Useful checks include:

```bash
npm run test:config
npm run test:runtime-overrides
npm run test:basic
```

For runtime or tenant-sensitive changes, also verify behavior in the target environment or topology.
