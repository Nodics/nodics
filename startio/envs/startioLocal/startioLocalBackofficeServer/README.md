# startioLocalBackofficeServer

`startioLocalBackofficeServer` is the local modular runtime composition for the
Nodics BackOffice registry capability in `gExp/backoffice`.

It activates the BackOffice capability on `http://localhost:3060/nodics/backoffice`
and declares the separately running Profile server at `http://localhost:3000` for
human authentication and authorization dependencies. It does not copy registry
contracts into the environment layer and does not proxy calls to other modules.

The environment server exists for local runtime and topology validation. Production
deployments may replace its host, port, node, secret, discovery, and scaling settings
through Nodics configuration layering without changing the BackOffice capability.
