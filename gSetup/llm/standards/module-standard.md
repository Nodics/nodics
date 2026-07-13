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

For new modules, the physical folder should match `package.json.name` unless a
framework-owned compatibility convention explicitly requires an `n` namespace
folder such as `nRouter` for runtime module `router`. Template packages are
exempt because their identities contain generation placeholders.

The `n` prefix is a naming convention, not a runtime classifier. Some `n*`
packages are capability groups, while others are ordinary capabilities or web
modules. Module kind must always come from `package.json.nodics.kind`, and
runtime flags must come from `package.json.nodics.runtime`.

Never rename an established runtime identifier merely to match a folder. Such a
change requires an explicit compatibility migration for active-module lists,
dependencies, persisted configuration, routes, tests, and generated artifacts.
Historical directory/package mismatches should be documented and migrated
deliberately rather than corrected mechanically.

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
