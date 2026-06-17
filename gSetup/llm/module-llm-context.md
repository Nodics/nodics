# Module LLM Context

Nodics modules may own their own LLM context just like they own `config`, `data`, `src`, and `test`.

Global LLM instructions live in `gSetup/llm`. Module-specific knowledge lives beside the module that owns the capability.

`gSetup` itself is the global human-authored LLM enablement module. It should not receive generated module context under `gSetup/llm/generated`.

## Folder Contract

Each module can contain:

```text
llm/
  README.md
  generated/
    module-context.md
    schemas.md
    tests.md
    manifest.json
```

`README.md` is the stable module entry point. Developers may add more human-authored files for intent, examples, extension decisions, and implementation guidance.

`generated/` is recreated from source definitions. Do not edit generated LLM files manually.

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

## Override Rule

If a project module overrides a framework module, the project module should add its own `llm` context. LLMs must read global `gSetup/llm`, then framework module context, then later project/environment/server/node module context to understand effective behavior.

Do not change out-of-the-box Nodics code when the intended behavior can be implemented in a later module layer.
