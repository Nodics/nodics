# startioLocal

`startioLocal` is the local development environment module for the `startio` application.

Use this module for local-only configuration and server composition. Shared application behavior belongs in `modules`, and server/node settings belong in child topology modules.

Local values should remain explicit, replaceable, and isolated from higher environments.

## Runtime topologies

The local environment proves two independent backend deployment choices. The
consolidated topology starts all required Nodics capabilities on the single
`monoServer` process. The modular topology starts Profile, NEMS, DEAP,
Cronjob, CMS Staged, CMS Online, Workflow, and BackOffice as separate processes.

CMS Staged and CMS Online use different databases and runtime roles. Staged
owns authoring, versioning, approval, and publication initiation. Online owns
non-versioned delivery state. Approved data crosses that boundary only through
Workflow and nPublish contracts.

These test topologies are alternatives and must not be started together because
the consolidated runtime and modular Profile runtime intentionally share local
port `3000`. No frontend application is part of this environment boundary.

See [the local backend topology guide](docs/local-backend-runtime-topologies.md)
for ports, startup commands, expected results, and troubleshooting.
