# Nodics Code Documentation Standard

Nodics source documentation must describe the platform contract, not only the local implementation. A file may be overridden by a later module in the hierarchy, so comments should explain ownership, extension points, request/response contracts, and side effects.

## Three Documentation Levels

### 1. File Or Module Level

Every source file that exports a Nodics artifact should have a JSDoc block before `module.exports`.

Required details:

- `@module` logical module and artifact name.
- `@description` enterprise/platform purpose.
- `@layer` one of `module`, `config`, `schema`, `router`, `controller`, `facade`, `service`, `pipeline`, `event`, `interceptor`, `validator`, `data`, `test`.
- `@owner` logical owning module.
- `@override` how project modules may replace or extend the artifact.
- `@since` optional when known.

Example:

```js
/**
 * @module system/controller/DefaultConfigurationController
 * @description Controller for runtime configuration changes in the Nodics control plane.
 * @layer controller
 * @owner system
 * @override Project modules may provide a later-loaded controller with the same generated name.
 */
module.exports = {};
```

### 2. Property Or Contract Level

Document exported constants, object properties, configuration keys, schema attributes, and important request fields.

For Nodics services/controllers, this includes global dependencies and request mutations:

- `@property` global service/facade/controller dependency used by the artifact.
- `@property` request fields read or written by the operation.
- Configuration keys read through `CONFIG.get(...)`.
- Dynamic global registries such as `SERVICE`, `FACADE`, `CONTROLLER`, `CLASSES`, `ENUMS`, and `NODICS`.

Example:

```js
/**
 * @property {Object} FACADE.DefaultConfigurationFacade Handles runtime configuration persistence.
 * @property {Object} request.httpRequest Express request wrapper supplied by the router pipeline.
 * @property {Object} request.config Normalized configuration payload added by this controller.
 */
```

### 3. Method Level

Every exported function should have a JSDoc block.

Required details:

- What the method does in platform terms.
- Parameters and expected request shape.
- Return type, including `Promise`.
- Callback style, if supported.
- Mutation and side effects.
- Error behavior.
- Override notes for extension points.

Example:

```js
/**
 * Applies a runtime configuration change request.
 *
 * @param {Object} request Nodics request context.
 * @param {Object} request.httpRequest Express request wrapper.
 * @param {Object} request.httpRequest.body Configuration payload.
 * @param {Function} [callback] Optional Node-style callback.
 * @returns {Promise|undefined} Promise when no callback is supplied.
 * @sideEffects Writes `request.config` and delegates to configuration facade.
 * @throws Propagates facade errors through callback or rejected promise.
 */
```

## Swagger And OpenAPI Preparation

Swagger/OpenAPI documentation should be generated from the same effective runtime contracts used by Nodics:

- Effective merged schemas from `DefaultDatabaseConfigurationService.getRawSchema()`.
- Effective router definitions from active module hierarchy.
- Controller method docs for non-schema routes.
- Security metadata from router definitions and header normalization.
- Tenant and enterprise headers as first-class API contract fields.

Do not hardcode project-specific route lists in documentation tooling. A project module must be able to extend schemas, routers, and controllers, then regenerate docs without changing Nodics core code.

Generate the current foundation contract with:

```bash
npm run docs:openapi
```

The generator initializes Nodics through the build-style module hierarchy, loads effective schema and router definitions, expands schema-driven CRUD routes plus common/module routers, and writes a rebuildable OpenAPI artifact under the active server or node module at `generated/openapi`. By default it emits file-backed contracts so documentation can be regenerated without requiring a live database.

Use runtime persisted schemas only when the backing database is intentionally available:

```bash
npm run docs:openapi -- --runtime-schemas
```

## Generated Files

Generated artifacts are disposable build output and must not be hand-documented directly. Their documentation comes from the generator, effective schema metadata, and the common source template.

Generated runtime files under `src/service/gen`, `src/facade/gen`, and `src/controller/gen` must include a generated header containing:

- `@generated`
- `@module generated/...`
- `@layer`
- `@owner`
- `@schema`
- `@model`
- `@sourceTemplate`
- `@override`

Example:

```js
/**
 * @generated
 * @module generated/service/DefaultCustomerService
 * @description Generated service for schema `customer` owned by module `profile`.
 * @layer service
 * @owner profile
 * @schema customer
 * @model CustomerModel
 * @sourceTemplate /src/service/common.js
 * @override Do not edit generated files directly. Customize behavior through a later module layer.
 */
```

Generated files are verified after build with:

```bash
npm run docs:coverage:generated
```

The normal source documentation gates intentionally run before generation. The build sequence validates source documentation first, generates artifacts, then validates generated-file headers.

## Rollout Order

1. Document core framework contracts: `nConfig`, `nCommon`, `nDatabase`, `nRouter`, `nService`, `nPipeline`.
2. Document platform capability modules: `nData`, `nEms`, `nSystem`, `nDynamo`, `nSearch`, `nbpm`, `nTest`.
3. Document core business modules: `profile`, `cronjob`, `nems`, `workflow`.
4. Document commerce/content/project modules only when they are active in the target product.
5. Add Swagger/OpenAPI generation once source-level and schema/router-level metadata are consistent.

## Coverage Check

Run:

```bash
npm run docs:coverage
```

This reports files and exported methods missing documentation blocks. It is intentionally non-blocking at first. Later we can enforce it in CI with:

```bash
npm run docs:coverage -- --fail
```

Use scoped checks during rollout:

```bash
npm run docs:coverage:framework-core
npm run docs:coverage:generated
npm run docs:coverage:runtime
npm run docs:coverage:contracts
npm run docs:coverage:source
```

The scanner also supports module and layer filters:

```bash
node scripts/check-documentation-coverage.js --scope=runtime --module=nRouter --layer=service
node scripts/check-documentation-coverage.js --scope=contracts --module=profile --fail
node scripts/check-documentation-coverage.js --scope=generated --fail
```

This keeps documentation governance compatible with Nodics layering. Core Nodics modules, project modules, environment modules, servers, and nodes can all be documented with the same rules without hardcoding a product-specific module hierarchy.

## Documentation Governance

Documentation enforcement is controlled by:

```bash
docs/documentation-governance.json
```

Run governed checks with:

```bash
npm run quality:docs
```

Governance has two levels:

- `enforcedGates`: completed documentation slices that must remain fully documented.
- `reportOnlyGates`: unfinished rollout areas that should remain visible but must not block build.

The normal build runs `quality:docs` before generation. This protects completed slices from regression while the rest of the platform is documented incrementally. Runtime startup does not run documentation gates; server availability should not depend on source documentation completeness.

When a module/layer reaches full coverage, add it to `enforcedGates`. Do not enforce a broad scope until its coverage is already clean.
