# nTest

`nTest` owns Nodics test discovery, declarative UTest/NTest execution, generated
schema/API coverage, guarded live tests, topology-aware reporting, and dedicated
test-tenant safety.

## Layered declarative tests

When `test.enabled` is true, every active module contributes JavaScript test
definitions from `test/common`. Active modules are processed in module-index
order, so later project, environment, server, and optional node modules may
extend or replace earlier suites without changing Nodics source. Module names
and folder-name suffixes do not control behavior.

Additional module-relative discovery locations may be configured through:

```js
test: {
    layeredDiscovery: {
        enabled: true,
        paths: ['test/project-scenarios']
    }
}
```

Each suite declares `options.type` as `utest` or `ntest`. The effective pools
remain available as `TEST.uTestPool` and `TEST.nTestPool`. Discovery sources,
module kinds, suite names, pool selection, and overrides are observable through
`TEST.discovery`.

Environment/server/node-specific tests should normally be owned by those active
modules under their own `test/common` directory. This keeps selection metadata
driven and avoids hardcoded names such as `local` or `production`.

## Other test surfaces

- `npm run test:basic` runs deterministic framework and module contracts.
- `npm run test:full` adds consolidated and modular topology checks.
- `npm run test:generated` validates generated schema and API contracts.
- Guarded live CRUD/access-policy tests require an explicit dedicated test
  tenant and destructive-test opt-in variables.
- Test reports are generated under the selected server module.

## Test Model

Nodics separates U-Test and N-Test concepts and supports suite options plus
startup/API-triggered execution. Preserve that developer-facing distinction when
writing module guidance, while keeping current behavior governed by the layered
discovery and generated-context contracts above.

Every feature that adds or changes an extension point should include a test
showing that a later-loaded module can override or customize the behavior
without editing out-of-the-box Nodics code.
