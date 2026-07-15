# Example: Creating Or Changing A Schema

Use this example when a developer asks for a new model, field, generated CRUD API, data shape, or persistence behavior.

## Scenario

Add a business record that stores approval state and can be exposed through generated APIs.

## Correct Ownership

The schema belongs to the module that owns the business meaning of the data.

- Framework-wide data belongs in the framework capability module.
- Customer-specific data belongs in the customer project module.
- Provider-specific data belongs in the provider module only when it is part of that provider contract.
- Tenant-specific differences should use layered schema/configuration behavior rather than hardcoded framework fields.

## Correct Layering

Use this order:

1. Add or update schema definitions in the owning module's `src/schemas/schemas.js`.
2. Add indexes under `src/search/indexes.js` when the data must be searchable.
3. Add status values in `src/utils/statusDefinitions.js` when lifecycle state is needed.
4. Add enums in `src/utils/enums.js` when a controlled value list is needed.
5. Add validators, interceptors, services, or pipelines when schema data needs behavior.
6. Regenerate generated artifacts.
7. Add generated and focused tests.
8. Update module README, public docs when user-facing, and generated LLM context.

## Source Definition Rule

Schemas are source definitions. They drive generated models, services, facades, controllers, routers, tests, OpenAPI output, import/export behavior, and search behavior.

Do not edit generated model, API, or test output as the source of truth. Change the schema definition, rebuild, and validate.

## Tenant And Access Rules

Before changing a schema, decide:

- Is the record tenant-owned?
- Can every tenant see the same fields?
- Does schema/property access policy hide, mask, or protect fields?
- Is the schema imported, exported, indexed, or audited?
- Does existing data need migration or compatibility handling?

## Tests

Add or regenerate tests for:

- generated CRUD behavior;
- required field validation;
- tenant isolation;
- access policy behavior when fields are protected;
- import/export behavior if the schema participates in data exchange;
- search indexing when the schema is searchable;
- override behavior when later modules extend or refine the schema.

## Verification

```bash
npm run clean
npm run build
npm run test:generated
npm run test:basic
npm run docs:openapi
npm run llm:generate
npm run llm:validate
```

Use focused module tests when the owning module has a smaller command.

## What To Avoid

Avoid:

- adding fields directly to generated model files;
- bypassing tenant behavior;
- adding search behavior without index definitions;
- changing import/export behavior without tests;
- hiding schema changes from module documentation;
- putting customer-only fields into reusable framework schemas.
