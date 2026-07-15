# How To Test Nodics Changes

Testing in Nodics proves that capabilities still work after framework, project, configuration, or generated-artifact changes.

Tests are not only for finding bugs. They are part of the platform contract.

## Choose The Right Test

Use focused tests while developing.

Use broader suites before committing or releasing.

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

## Live Tests

Some tests require live infrastructure such as Redis.

Live tests should be explicit and guarded. They should not silently use shared developer, staging, or production data.

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

## What To Avoid

Avoid:

- Only running the test that proves your happy path.
- Skipping generated tests after schema or route changes.
- Running live tests against unsafe data.
- Editing generated tests manually as the source of truth.
- Updating code without updating documentation.

