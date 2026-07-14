# Module Structure Contract

Every Nodics module and submodule should be easy for humans and AI agents to
discover, understand, customize, and validate.

Standard structure:

```text
module/
  AGENTS.md
  README.md
  package.json
  config/
  data/       # optional for concrete modules that own init/core/sample import data
  docs/
  llm/
    README.md
    contracts/
    examples/
    generated/
  src/
  test/
```

`README.md` is the human entrypoint. `AGENTS.md` is the AI/developer behavior
contract. `docs/` contains permanent module documentation. `llm/` contains
AI-specific guidance, examples, contracts, and generated context.

`docs/` is never a runtime module source. Raw module discovery must skip folders
named `docs`, including root reference material and module documentation, even
when copied material under `docs/` contains `package.json` files.

`data/` is optional and must be owned by the concrete module whose records are
being imported. Supported module-owned system data directories are `data/init`
for startup/bootstrap data, `data/core` for core/reference imports, and
`data/sample` for demo/sample imports. Do not create empty `data/` folders on
project roots or pure group modules.

`llm/contracts/` and `llm/examples/` are maintained source folders, not
generated output. AI tools and developers must update them when functionality
changes the module contract or recommended customization pattern.

Aggregator modules and their child modules follow the same convention. For
example, `nCache`, `nCache/cache`, `nCache/redisCache`, `nCache/nodeCache`, and
`nCache/hazelcastCache` are independent module boundaries and must link their
guidance through the hierarchy.

Customer/project modules follow the same shape. Customer customization must be
implemented in project modules and layered overrides, not by editing Nodics
framework modules.

## Loader-Radar Contract

Runtime artifacts must live where the Nodics loader can discover and merge them:

- services: `src/service/**/*Service.js`
- controllers: `src/controller/**/*Controller.js`
- facades: `src/facade/**/*Facade.js`
- pipeline definitions: `src/pipelines/**/*Definition.js`

These files must export mergeable objects, normally
`module.exports = { methodName: function (...) {} }`, so later-loaded modules can
override one method without copying the full framework implementation. A file
that does not match the loader path and suffix is not a runtime extension point.
Move helper code to a non-loader directory, rename runtime artifacts to match
the loader, or document generator templates with `@layer template` and
`@sourceTemplate`.

Tooling adapters, context generators, debug launchers, and quality checks live
under `src/service` as well, using explicit subfolders such as
`src/service/command`, `src/service/context`, `src/service/debug`, and
`src/service/quality`. They must use `*Service.js` filenames and
`module.exports = { methodName: function (...) {} }` style exports so developers
and AI tools do not invent parallel source structures.

## Configuration Ownership Contract

Every module uses `config/properties.js` as the standard home for configurable
values, policy defaults, command declarations, discovery settings, and
governance gate data. Specialized configuration should be represented as
namespaced property subtrees such as `tooling.commands`,
`tooling.discovery`, or `tooling.documentationGovernance`.

Do not add sibling config files like `config/tooling.js` or
`config/documentation-governance.json` merely to avoid touching
`properties.js`. A new config artifact is valid only when it has a distinct
loader/generator contract that cannot be expressed as properties, and that
exception must be documented in the owning module README and tests.

New project, environment, server, and node modules must follow
`gSetup/llm/module-generation-guide.md`. Generation must be driven by module
metadata, active-module registration, layered configuration, source
definitions, tests, documentation, and regenerated artifacts. Do not revive or
copy `nCommon/templates`; the retired template folder is intentionally removed
from active scaffolding.
