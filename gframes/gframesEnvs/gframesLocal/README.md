# gframesLocal

`gframesLocal` is the local environment module for the `gframes` application. It contributes local-only configuration and composes the local server topology.

Use this module for local development defaults. Shared application behavior belongs in `gframesModules`, and server-specific runtime configuration belongs in child server modules.

Local values should stay overrideable and must not become framework defaults.
