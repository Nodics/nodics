# startioLocal

`startioLocal` is the local development environment module for the `startio` application.

Use this module for local-only configuration and server composition. Shared application behavior belongs in `modules`, and server/node settings belong in child topology modules.

Local values should remain explicit, replaceable, and isolated from higher environments.
