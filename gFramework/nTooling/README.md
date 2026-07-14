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
