# Module LLM Context

Nodics modules may own their own LLM context just like they own `config`, `data`, `src`, and `test`.

Global LLM instructions live in root `AGENTS.md` and `gSetup/llm`. Module-specific knowledge lives beside the module that owns the capability.

`gSetup` itself is the global human-authored LLM enablement module. It should not receive generated module context under `gSetup/llm/generated`.

## Folder Contract

Each module can contain:

```text
AGENTS.md
README.md
llm/
  README.md
  generated/
    module-context.md
    schemas.md
    tests.md
    manifest.json
```

`README.md` is the stable human module entry point. `AGENTS.md` is the stable AI/developer behavior contract for that module boundary. Developers may add more human-authored files for intent, examples, extension decisions, and implementation guidance.

`generated/` is recreated from source definitions. Do not edit generated LLM files manually.

The file inventory inside `module-context.md` covers every module-owned file included in the generated context fingerprint. It extracts documented purpose from source JSDoc and reports documentation coverage without inventing missing intent.

## Lifecycle

Clean removes generated LLM context:

```bash
npm run llm:clean
```

Build regenerates module LLM context:

```bash
npm run llm:generate
```

The standard `npm run clean` and `npm run build` scripts execute these commands so generated LLM intelligence follows the same clean/build discipline as generated services, routers, controllers, facades, and tests.

## Schema Changes

When a developer adds or updates a schema, the source schema remains the system of record. The next build updates the owning module's generated schema context.

The generated schema context should be used by LLMs for current source-derived facts, while human-authored module notes should explain business meaning, extension rules, security expectations, and customization examples.

## File Documentation Status

Generated file context uses four explicit states:

- `documented`: file-level documentation and all detected exported-method documentation are present for a module-owned JavaScript file.
- `partially-documented`: some required file or exported-method documentation is absent.
- `undocumented`: the file exists, but its required platform-level documentation has not been added.
- `inventory-only`: a non-JavaScript file is tracked for module understanding; its native format remains the documentation source.

These states describe documentation only; they never imply that a file, module, or runtime capability is absent. Human review must confirm that documentation explains platform purpose, ownership, inputs, outputs, side effects, errors, tenant behavior, and the layered override path where applicable.

`manifest.json.sourceFingerprint` covers every inventoried module-owned file. `npm run llm:validate` fails when generated context is stale or omits a file.

## Tool-Neutrality Contract

The `llm` folder name describes the intended consumer category; it does not bind Nodics to a vendor or product. Canonical guidance must remain portable Markdown and JSON, avoid proprietary command requirements, and work for humans as well as automated assistants. Optional vendor adapters may point to root `AGENTS.md` and `gSetup/llm/README.md`, but must not duplicate or replace canonical Nodics rules.

## Override Rule

If a project module overrides a framework module, the project module should add its own `llm` context. LLMs must read global `gSetup/llm`, then framework module context, then later project/environment/server/node module context to understand effective behavior.

Do not change out-of-the-box Nodics code when the intended behavior can be implemented in a later module layer.

## Module Metadata

`package.json` remains the single module manifest. Do not add a parallel metadata file.

Nodics-specific metadata belongs under `package.json.nodics`:

```json
{
  "nodics": {
    "kind": "capability",
    "runtime": {
      "router": true,
      "publish": false,
      "web": false
    },
    "runtimeModule": true,
    "loadableByNodicsModuleLoader": true,
    "owns": ["configuration", "schema", "router", "service", "test", "llm"]
  }
}
```

Do not use top-level `type` for Nodics metadata, and do not add `nodics.moduleType`. `nodics.kind` describes what the package is. `nodics.runtime` describes runtime activation behavior. `nodics.owns` describes owned artifacts and extension points.
