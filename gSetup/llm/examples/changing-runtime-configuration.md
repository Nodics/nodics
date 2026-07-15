# Example: Changing Runtime Configuration

Use this example when a developer asks to change behavior with configuration, tenant overrides, runtime activation, policy values, feature flags, provider choices, permissions, or operational limits.

## Scenario

Allow one tenant to use a stricter import file-size limit than the default environment.

## Correct Ownership

Configuration belongs to the smallest layer that owns the change.

- Framework defaults belong in the owning module's `config/properties.js`.
- Project defaults belong in the project module.
- Environment, server, and node differences belong in their own module layers.
- Tenant-specific active behavior belongs in governed runtime configuration when the setting must change without code release.
- Secrets belong in secret governance, not in source-controlled configuration.

## Correct Layering

Use this order:

1. Identify the owning capability and property namespace.
2. Confirm the property already exists or add it to the owning module's `config/properties.js`.
3. Resolve the property through the existing configuration service or runtime governance path.
4. Add validation, preview, approval, activation, audit, and rollback when the change is mutable at runtime.
5. Add tenant/environment/server/node tests for precedence and override behavior.
6. Update docs and generated LLM context.

## Runtime Governance Rule

Runtime configuration is not a shortcut around source ownership. It activates governed values for a known property contract.

Do not introduce a runtime setting unless:

- the setting has a named owner;
- the value shape is validated;
- secret paths are rejected or governed correctly;
- activation is audited;
- rollback behavior is defined;
- tests prove default and override resolution.

## Tests

Add tests for:

- default property resolution;
- project/environment/server/node override resolution;
- tenant-specific runtime override resolution;
- invalid value rejection;
- secret-path rejection when applicable;
- preview/request/approve/activate/audit/rollback lifecycle when runtime governance applies;
- safe fallback when no override exists.

## Verification

```bash
npm run test:config
npm run test:dynamo
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

Use more focused commands when the owning module provides them.

## What To Avoid

Avoid:

- creating parallel configuration files for values that belong in `config/properties.js`;
- hardcoding policy values in services, controllers, or routers;
- using runtime configuration to invent unnamed behavior;
- storing credentials or tokens in source-controlled files;
- changing tenant behavior without tests;
- bypassing preview, audit, or rollback for mutable production settings.
