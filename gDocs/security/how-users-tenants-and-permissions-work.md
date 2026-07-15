# How Users, Tenants, And Permissions Work

Nodics applications are tenant-aware.

A tenant represents an isolated business context. Different tenants can have different users, permissions, data, configuration, and runtime behavior.

## Why Tenants Matter

Tenant isolation helps one platform serve multiple business contexts safely.

Examples:

- One customer can use the same application without seeing another customer's data.
- A business can test configuration for one tenant before enabling it for another.
- Runtime configuration can be audited per tenant.
- Data imports can target a specific tenant.

## Users And Groups

Users are assigned to groups.

Groups can hold permissions.

Permissions decide what a user or service account can do.

When adding a feature, define the required permissions clearly. Do not rely on hidden checks that only one developer understands.

## Human Login

Human login routes are pre-authentication because the user does not have a token yet.

Only true login or credential initiation routes should be pre-authentication.

After login, secured APIs must validate authentication, tenant context, and permissions.

## Service-To-Service Access

Internal module or service access is different from human login.

Internal access should remain secured and should use the configured internal token or service-account permission model.

Do not make internal routes public just to make module-to-module calls easier.

## Runtime Security

Runtime changes must be governed.

Important runtime actions should include:

- Preview.
- Request.
- Approval.
- Activation.
- Audit.
- Rollback.
- Diagnostics.

This applies especially to configuration, route permissions, schema behavior, and tenant-sensitive settings.

## Testing Security

Security tests should cover:

- Login route behavior.
- Token validation.
- Permission checks.
- Tenant isolation.
- Service account access.
- Invalidation after security changes.
- Audit records without secrets.

Useful commands:

```bash
npm run test:suite -- --suite=headers
npm run test:suite -- --suite=auth-p2
npm run test:basic
```

## What To Avoid

Avoid:

- Marking routes unsecured without a documented reason.
- Mixing human login rules with service-to-service rules.
- Skipping tenant context checks.
- Logging secrets.
- Creating permissions without documentation.
- Adding runtime mutation paths without audit and rollback.

