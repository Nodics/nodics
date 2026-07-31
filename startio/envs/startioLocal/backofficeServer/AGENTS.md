# backofficeServer Agents

## Inheritance

- Follow the root Nodics AI contract: `../../../../AGENTS.md`.
- Follow the local environment contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../../../../gSetup/llm/README.md`.

## Runtime Boundary

`backofficeServer` is the local runtime composition for the `gExp/backoffice`
capability. Keep BackOffice as a separate API-consuming client/workstream and do
not add frontend source, UI ownership, or project-specific registry authority to
Nodics core.

## Work Rules

- Preserve Nodics structure, layering, override, documentation, and test contracts inside this boundary.
- Keep local host, port, node, secret, discovery, and scaling behavior in layered configuration.
- Do not copy BackOffice registry contracts into this environment layer.
- Do not proxy calls to other modules from this server composition.
