# How To Test Nodics Changes

Testing in Nodics proves that capabilities still work after framework, project, configuration, or generated-artifact changes.

Tests are not only for finding bugs. They are part of the platform contract.

## Beginner Summary

Testing in Nodics answers four questions:

| Question | Example proof |
| --- | --- |
| Does the default framework behavior still work? | Framework/module test passes |
| Does the project override work? | Later-module override test passes |
| Is the behavior secure and tenant-safe? | Permission, auth, tenant, cache, and data isolation tests pass |
| Are generated artifacts still aligned with source? | Generated schema/API/OpenAPI/LLM tests pass |

Do not only test the happy path. A good Nodics change proves success, failure,
permission denial, tenant behavior, configuration override, and generated
artifact alignment where relevant.

## Choose The Right Test

Use focused tests while developing.

Use broader suites before committing or releasing.

Nodics testing is layered in the same way as the framework. A module can own common tests, environment-specific tests, generated schema/API tests, provider tests, topology tests, and override/customization tests.

The goal is not only to prove one function works. The goal is to prove the capability still works through the hierarchy.

## Common Commands

Syntax check:

```bash
npm run check:syntax
```

Main deterministic gate:

```bash
npm run test:basic
```

Full gate with modular topology:

```bash
npm run test:full
```

Configuration and tooling:

```bash
npm run test:config
npm run test:tooling
```

Generated API and schema contracts:

```bash
npm run test:generated
```

Import behavior:

```bash
npm run test:import
```

Runtime configuration:

```bash
npm run test:runtime-overrides
```

Run a named suite:

```bash
npm run test:suite -- --suite=<suite-name>
```

## What To Test For A New Feature

Test:

- Valid input.
- Invalid input.
- Permission failure.
- Tenant behavior.
- Configuration override behavior.
- Runtime behavior if runtime configuration is involved.
- Generated API behavior if schemas or routes changed.
- Documentation and generated context if source files changed.

For extension points, also test:

- default framework behavior;
- later module override behavior;
- configuration override behavior;
- tenant-specific behavior when tenant context is involved;
- consolidated runtime behavior;
- modular process behavior when modules communicate across servers.

## Test Selection Guide

| Change type | Start with | Also consider |
| --- | --- | --- |
| JavaScript syntax or file-level edit | `npm run check:syntax` | `npm run quality:docs` |
| Configuration or module metadata | `npm run test:config` | `npm run test:basic` |
| API route/controller/facade/service | Route contract and focused capability test | `npm run docs:openapi`, `npm run test:basic` |
| Schema or generated CRUD | `npm run test:generated` | `npm run build`, `npm run docs:openapi` |
| Import/export | `npm run test:import` | Capability tests and tenant tests |
| Cache | `npm run test:cache` | Redis release gate only when Redis behavior changed |
| Auth, permission, tenant | Header/auth/security suites | `npm run test:basic` |
| Runtime configuration | `npm run test:runtime-overrides` | Dynamo/runtime governance tests |
| Topology/server/node behavior | `npm run test:topology` | Consolidated and modular topology tests |
| Documentation or AI guidance | `npm run quality:docs`, `npm run llm:validate` | `npm run llm:generate` first |

## Live Tests

Some tests require live infrastructure such as Redis.

Live tests are explicit and guarded. They do not silently use shared developer, staging, or production data.

Example:

```bash
NODICS_CACHE_REDIS_URL=redis://127.0.0.1:6379 npm run test:cache:release
```

## Documentation Checks

Run:

```bash
npm run docs:coverage:source -- --limit=20
npm run docs:coverage:contracts -- --limit=20
```

If a source file changes, make sure file-level documentation and exported method documentation remain complete.

## Generated Context

When source behavior or documentation changes, regenerate and validate LLM context:

```bash
npm run llm:generate
npm run llm:validate
```

Generated LLM context is part of the verification story. It helps future AI tools and developers understand which files, tests, extension points, generated artifacts, and documentation belong to a module.

## What To Avoid

Avoid:

- Only running the test that proves your happy path.
- Skipping generated tests after schema or route changes.
- Running live tests against unsafe data.
- Editing generated tests manually as the source of truth.
- Updating code without updating documentation.

## Beginner Failure Handling

When a test fails:

1. Read the first failed assertion.
2. Identify the owner: module, route, schema, service, config, provider, or generated artifact.
3. Check whether the failure is from source behavior or stale generated output.
4. Fix the source definition or implementation.
5. Regenerate generated artifacts when needed.
6. Rerun the smallest failed test.
7. Rerun the broader suite only after the focused test is green.

Do not hide a failing test by weakening the assertion unless the product
contract intentionally changed and the documentation also explains that change.
