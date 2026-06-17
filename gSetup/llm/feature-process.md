# Feature Process

Follow this process for every new Nodics capability or modernization change.

## 1. Understand Ownership

Identify:

- owning module
- owning layer
- affected schemas
- affected services/facades/controllers/routers
- affected data import/export behavior
- affected tenants
- affected runtime topology
- affected generated artifacts
- affected tests

Do not start coding before knowing whether behavior belongs in framework, core business module, project module, environment module, server module, or node module.

For significant feature, refactor, security, documentation, or testing changes, also apply `prompts/enterprise-architecture-quality-prompt.md` so the implementation is reviewed for ownership, dependencies, coupling risk, deployment impact, generated artifact impact, and automated test strategy.

## 2. Preserve Overrideability

Ask:

- Can a project override this behavior in a later-loaded module?
- Can a project extend the schema without changing core?
- Can a project replace the service/facade/controller/router?
- Can runtime configuration govern this behavior if needed?
- Does this hardcode a project, module group, tenant, environment, server, or node?

If the answer reveals tight coupling, redesign before coding.

## 3. Choose The Right Source Of Truth

Use schema definitions for schema-driven data/API behavior.

Use router definitions for static route contracts.

Use runtime configuration models for admin-controlled runtime behavior.

Use service contracts for behavior that must be replaceable.

Use pipelines/interceptors/events for extension points and ordered execution.

Do not place source-of-truth behavior only in generated files.

## 4. Implement Layer By Layer

Preferred order:

1. schema/config/route source definitions
2. generated artifact impact
3. service contract
4. facade boundary
5. controller mapping
6. router exposure
7. tests
8. documentation/TODO updates

## 5. Add Tests

Minimum test categories:

- positive behavior
- negative behavior
- missing dependency behavior
- override/customization behavior where practical
- generated artifact contract if schema/router driven
- tenant/request context behavior if relevant
- clean/build regeneration if generated files are affected

## 6. Run Verification

Run focused tests first, then broader tests.

For schema or router changes, run:

```bash
npm run clean
npm run build
npm run test:generated
npm run test:basic
```

For service-only changes, run focused tests plus `npm run test:basic` when shared behavior is affected.

## 7. Keep Documentation Current

Update:

- `docs/TODO`
- relevant `gSetup/llm/*` files
- module-level documentation where applicable
- governance/openapi docs when affected

When module schemas, tests, source layout, or ownership metadata changes, run:

```bash
npm run llm:generate
```

Generated module LLM context belongs under each module's `llm/generated` folder. Do not manually edit generated module context.

## 8. Commit Coherent Slices

Commit related changes as one coherent slice.

Examples:

- `Add import run summary reporting`
- `Expose import run history`
- `Add runtime access policy enforcement`

Avoid mixing unrelated refactors with feature behavior.
