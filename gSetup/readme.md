# gSetup

`gSetup` contains Nodics setup, onboarding, and instruction-level assets.

It intentionally looks like a first-class Nodics top-level area, but it is **not** part of Nodics runtime module loading.

`gSetup` includes the standard module-shaped files `package.json`, `nodics.js`, and `readme.md` so developers recognize it as a first-class Nodics repository area.

It is excluded from runtime startup by `package.json` metadata:

```json
{
    "runtimeModule": false,
    "nodics": {
        "runtimeModule": false,
        "loadableByNodicsModuleLoader": false
    }
}
```

Today it is a setup/instruction package, not a runtime module.

This folder is intended for project-wide enablement material that should survive beyond temporary refactoring notes. It is not a generated artifact folder and should not be removed by clean/build.

Current contents:

- `llm/`: tool-neutral context, prompts, decision memory, examples, and working rules for AI-assisted Nodics development.
- `package.json`: machine-readable setup package metadata with runtime loading disabled.
- `nodics.js`: no-op lifecycle file retained only for module-shape consistency.

## LLM Bootstrap

When starting any AI-assisted Nodics project, ask the LLM to read:

```text
gSetup/llm/README.md
```

Then ask it to follow the linked principles, modular architecture, schema/generation rules, testing playbook, and feature process before making code changes.

If an AI tool automatically scans the repository, this folder should be treated as the canonical instruction source for Nodics development behavior.

## Runtime Boundary

Do not add runtime module behavior here unless `gSetup` is intentionally promoted into the active module hierarchy with a clear startup contract.

Do not include `gSetup` in server/module startup lists.

Do not place generated build artifacts in `gSetup`.

The config module has a test that protects this rule: `gFramework/nConfig/test/nonRuntimePackageDiscovery.test.js`.
