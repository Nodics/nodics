# How Configuration Works

Configuration tells Nodics how to run.

It controls active modules, ports, database connections, cache settings, security rules, import behavior, runtime governance, and many other platform features.

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

## How To Verify Configuration Changes

Run focused tests where available.

Useful checks include:

```bash
npm run test:config
npm run test:runtime-overrides
npm run test:basic
```

For runtime or tenant-sensitive changes, also verify behavior in the target environment or topology.
