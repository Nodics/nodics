# Example: Creating A New API

Use this example when a developer asks for a new endpoint, route, action, or API behavior.

## Scenario

Add an API that allows an authorized user to approve a business record.

## Correct Ownership

Before writing code, identify the capability owner.

- If the record belongs to an existing capability, add the API in that module.
- If the record belongs to a customer project, add the API in the project module.
- If the API only customizes framework behavior, prefer a later project module override.
- Do not add the route to a central framework module only because the URL is easy to find.

## Correct Layering

Use this order:

1. Add or update the source schema if the API needs new stored data.
2. Add route metadata in the owning module's `src/router/routers.js`.
3. Map request and response concerns in `src/controller`.
4. Put orchestration in `src/facade` when the API crosses capability boundaries.
5. Put business behavior in `src/service`.
6. Put policy defaults, permission names, limits, or feature flags in `config/properties.js`.
7. Add tests in the owning module's `test` folder.
8. Update the module `README.md`, public documentation when user-facing, and generated LLM context.

## Route Contract

Every route must define:

- HTTP method and path.
- Controller and action.
- Authentication behavior.
- Permission or `permissionConfig`.
- Tenant behavior.
- Request body or query contract.
- Response shape.
- Help/OpenAPI metadata when applicable.

Login routes are pre-authentication routes. Internal token, module-to-module, and user mutations must remain secured unless the route has an explicit documented reason.

## Service Style

Service behavior must be loader-visible and overrideable:

```js
module.exports = {
    approveRecord: function (request) {
        return new Promise((resolve, reject) => {
            // Validate input, resolve tenant, call generated services, emit events, and return a standard response.
            resolve({ code: request.code, status: 'APPROVED' });
        });
    }
};
```

Do not export anonymous classes, hidden closures, or ad hoc helper modules when the behavior is intended to be customized by later modules.

## Tests

Add focused tests for:

- route metadata and permission configuration;
- controller request mapping;
- service success behavior;
- validation failure behavior;
- denied permission behavior;
- tenant-specific behavior when tenant context matters;
- override behavior when a project module is expected to customize the result.

## Verification

Use the smallest applicable gates first, then the broader gates before commit:

```bash
npm run test:suite -- --suite=route-contracts
npm run test:generated
npm run llm:generate
npm run llm:validate
npm run quality:docs
```

If schema or generated API output changes, also run:

```bash
npm run clean
npm run build
```

## What To Avoid

Avoid:

- putting business behavior in route metadata;
- relying only on controller checks for security;
- hardcoding permissions that should come from configuration;
- editing generated API files manually;
- creating an API without module-owned tests;
- changing framework code for a customer-only API.
