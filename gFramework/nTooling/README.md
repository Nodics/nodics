# nTooling

`nTooling` owns Nodics development-time commands, quality gates, generators, and
repository inspection utilities. It is deliberately excluded from the runtime
module loader so application startup never depends on development tooling.

Tooling must resolve the target Nodics project explicitly and must not assume
that the framework source directory is the consuming application's root.

Project-specific tooling belongs in project modules and will be composed through
the tooling command contract in module-index order. Runtime pre-scripts and
post-scripts remain separate startup extension points owned by `nConfig`.

Command declarations live under `tooling.commands` in module-owned
`config/properties.js` files. The loader composes framework contributions
first, then later-index customer project contributions, requiring an explicit
`$override.mode: 'replace'` when a command handler changes.

`mcp:governance` is the first MCP-facing tooling surface. It prints read-only
JSON that future MCP adapters can expose for workspace summary, module
discovery, nearest `AGENTS.md`, generated module context, and change-impact
guidance. The command is navigation over existing Nodics contracts only; it
must not persist decisions, mutate source, write runtime configuration,
regenerate artifacts, change data, or call external providers.

The MCP command family is intentionally staged:

- `mcp:governance` reports read-only workspace and change-impact context.
- `mcp:validate` runs only approved Nodics validation commands and returns
  structured results.
- `mcp:runtime-context` explains hierarchy, active-module declarations,
  artifact ownership, and override paths from source files without bootstrapping
  the runtime.
- `mcp:mutation-plan` creates guarded mutation/generation plans for module
  skeletons, documentation updates, generated artifacts, build, and clean
  actions without executing writes by default.

Customer projects should customize MCP behavior by contributing the same command
name from a later tooling module and/or contributing the same service filename
under `src/service/mcp`. For example, a customer module can override only
`createPlan` by adding
`src/service/mcp/defaultMcpMutationGuardService.js` with a `createPlan`
function. The nTooling service merge keeps other default methods, such as
`getActionCatalog`, from the framework service. Replacing the whole command
handler is still possible, but it requires the normal explicit
`$override.mode: 'replace'` governance.

## Capability

`nTooling` provides:

- the `nodics-tool.js` command entrypoint;
- command discovery from layered `tooling.commands` properties;
- explicit command override governance;
- clean/build/lifecycle command wrappers;
- test-suite command orchestration;
- documentation coverage and documentation gate checks;
- source structure compliance audits;
- copyright header governance;
- AI governance validation;
- design principle audits;
- module metadata normalization;
- module LLM context generation and validation;
- topology planning and structure generation support;
- MCP read-only, validation, runtime-context, and guarded mutation-plan command surfaces.

Tooling is non-runtime. It can inspect, generate, validate, and report, but application startup must not depend on the tooling module being loaded as a runtime capability.

## Command Contract

Commands belong in `config/properties.js` under `tooling.commands`. A command definition should identify:

- command name;
- service handler;
- description;
- arguments/options;
- whether it can write files;
- validation behavior;
- expected output shape;
- override policy.

Later modules may add commands. Replacing an existing command handler requires explicit `$override.mode: 'replace'` so accidental shadowing does not silently change developer workflows.

## Extension Path

Projects extend tooling by:

- adding project tooling modules;
- contributing commands through layered properties;
- adding services under `src/service`;
- overriding specific service functions through the Nodics service merge model;
- adding command contract tests;
- documenting the workflow in README and LLM guidance.

Keep project-specific automation out of framework source unless it is a reusable Nodics platform capability.

## Tests

Run:

```bash
npm run llm:validate
npm run quality:docs
npm run structure:audit -- --fail
node gFramework/nTooling/test/toolingCommandOverride.test.js
node gFramework/nTooling/test/moduleStructure.test.js
node gFramework/nTooling/test/documentationNavigationQuality.test.js
node gFramework/nTooling/test/mcpReadOnlyGovernanceContract.test.js
```

The documentation quality gate validates source documentation coverage and
public information architecture. It checks local link targets and path case,
root-to-`gDocs` reachability, page continuation links, required business and
beginner entry points, and complete package-module README coverage through the
public module catalog. Projects may change entry paths through
`tooling.documentationGovernance.navigation` without creating a second
documentation authority.

## What To Avoid

Avoid:

- making runtime startup depend on development tooling;
- placing command configuration outside layered `properties.js`;
- hardcoding repository-specific paths when project home should be resolved;
- creating mutation tools that write by default without explicit approval;
- letting MCP become a hidden source of architecture or runtime configuration;
- bypassing governance tests after changing command behavior.
