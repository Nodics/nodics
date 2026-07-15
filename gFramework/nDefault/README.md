# nDefault

`nDefault` is the minimal default framework baseline. It contributes empty but loader-visible configuration, schema, router, pipeline, enum, status, utility, lifecycle, test, documentation, and LLM structures that establish a safe default module contract.

Use this module only for framework baseline behavior that is intentionally generic, reusable, and safe for every Nodics runtime. Capability-specific defaults belong to the module that owns that capability.

## Capability

`nDefault` exists so the module loader and structure tooling always have a stable baseline shape. It does not own business behavior, public APIs, data models, or runtime policy.

The module provides:

- `config/properties.js` as an empty default property contribution;
- `src/schemas/schemas.js` as an empty schema contribution;
- `src/router/routers.js` as an empty route contribution;
- `src/pipelines/pipelines.js` as an empty pipeline contribution;
- `src/utils/enums.js` and `src/utils/statusDefinitions.js` as empty utility definition contributions;
- `nodics.js` lifecycle hooks that resolve successfully;
- module-owned test, docs, and LLM folders.

## Source Contracts

Every source file in this module is intentionally minimal. The value is not the content inside each file; the value is the standard module shape.

Later modules provide concrete behavior through the same loader-visible paths. This keeps generated modules, framework modules, and project modules aligned around one structure.

## Extension Path

Do not customize applications by editing `nDefault`. Instead:

- add capability behavior to the owning framework module;
- add project-specific behavior to the project module;
- add environment/server/node differences to their own module layers;
- add tenant-specific mutable behavior through runtime governance when appropriate;
- use `structure:generate` and the structure matrix for new module scaffolding.

`nDefault` should remain a small baseline. If it starts to contain domain behavior, the ownership decision is probably wrong.

## Configuration

`config/properties.js` is intentionally empty. It is a baseline contribution, not a dumping ground for unrelated defaults.

Add configuration to the module that owns the capability. For example:

- router policy belongs near router or owning capability configuration;
- import policy belongs under the import module;
- OTP policy belongs under `nOtp`;
- provider defaults belong under provider modules;
- project defaults belong under project modules.

## Tests

The module has common and environment-local smoke tests to prove it remains loadable. Broader structure and documentation gates also enforce the expected module shape.

Run:

```bash
npm run structure:audit -- --fail
npm run quality:docs
npm run test:basic
```

## What To Avoid

Avoid:

- adding business schemas, APIs, services, or policies to `nDefault`;
- using `nDefault` as a shared miscellaneous module;
- placing project defaults here;
- using the empty files as proof that behavior exists;
- deleting baseline files that structure tooling expects;
- bypassing the owning module just because `nDefault` loads early.
