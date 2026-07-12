# Nodics Module Standard

Every module-shaped package must preserve the same discoverable structure and
layered customization contract.

## Required Files

- `package.json`
- `nodics.js`
- `AGENTS.md`
- `README.md`
- `config/properties.js`
- `config/prescripts.js`
- `config/postscripts.js`
- `llm/README.md`
- generated module context for every package except `gSetup`

## Naming

`package.json.name` is the canonical runtime module identifier. It must be a
unique alphanumeric JavaScript-style name beginning with a letter.

The physical folder should either match that identifier or, for framework
capabilities, use the `n` namespace prefix such as `nRouter` for runtime module
`router`. Template packages are exempt because their identities contain
generation placeholders.

Never rename an established runtime identifier merely to match a folder. Such a
change requires an explicit compatibility migration for active-module lists,
dependencies, persisted configuration, routes, tests, and generated artifacts.

The repository-standard human entrypoint is upper-case `README.md`. The
repository-standard AI/developer behavior contract is upper-case `AGENTS.md`.

## Configuration

The three configuration files are mandatory even when empty. Empty files are
reserved layered extension points; they must export an object and explain why
they are empty. Runtime behavior must not be hidden in tooling or documentation.

## Documentation And Tests

The module README explains purpose, ownership, dependencies, configuration, and
customization. The module AGENTS file explains how AI agents and developers must
work inside that module boundary. Source files document their real contracts.
Generated context reports factual gaps and must not invent missing intent.

Capabilities require focused behavior tests. Container, topology, setup, and
template modules may rely on composition or topology tests, but their untested
status must remain visible in generated context and governance reports.

## Platform Contract

Framework modules provide defaults. Later project, environment, server, and node
modules may override implementations through standard loaders and governed
metadata without editing out-of-the-box framework code.
