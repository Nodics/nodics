# nTooling

`nTooling` owns Nodics development-time commands, quality gates, generators, and
repository inspection utilities. It is deliberately excluded from the runtime
module loader so application startup never depends on development tooling.

Tooling must resolve the target Nodics project explicitly and must not assume
that the framework source directory is the consuming application's root.

Project-specific tooling belongs in project modules and will be composed through
the tooling command contract in module-index order. Runtime pre-scripts and
post-scripts remain separate startup extension points owned by `nConfig`.

Command declarations live in optional module-owned `config/tooling.js` files.
This is intentionally separate from runtime `properties.js`, lifecycle
pre/post-scripts, and executable services. The loader composes framework
contributions first, then later-index customer project contributions, requiring
an explicit `$override.mode: 'replace'` when a command handler changes.
