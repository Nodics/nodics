# gSetup AI Examples

This folder contains examples that help AI agents and developers work correctly inside Nodics module, project, provider, environment, server, node, tenant, and runtime-governance boundaries.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Examples

- [Adding A New Nodics Feature](adding-new-feature.md)
- [Creating A New API](creating-new-api.md)
- [Creating Or Changing A Schema](creating-or-changing-schema.md)
- [Adding A Provider Implementation](adding-provider-implementation.md)
- [Creating A Scheduled Job](creating-scheduled-job.md)
- [Changing Runtime Configuration](changing-runtime-configuration.md)

Each example follows the same contract:

1. Decide the owner before writing code.
2. Use the smallest layer that can own the behavior.
3. Put configuration in `config/properties.js`.
4. Put source behavior in loader-visible `src/service`, `src/facade`, `src/controller`, `src/router`, `src/schemas`, `src/pipelines`, `src/interceptors`, `src/event`, or `src/utils` paths.
5. Change source definitions, then regenerate generated artifacts.
6. Prove default behavior and project override behavior where customization is part of the contract.
7. Update module README, public docs, and generated LLM context when behavior or extension guidance changes.
