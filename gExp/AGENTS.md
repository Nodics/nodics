# gExp Agent Contract

## Inheritance

- Follow the root Nodics contract: `../AGENTS.md`.
- Follow global guidance: `../gSetup/llm/README.md`.
- Follow the nearest child-module `AGENTS.md` for changes below this group.

## Group Boundary

- `gExp` groups backend/API capabilities that support administrative, customer,
  partner, storefront, mobile, and future client experiences.
- Do not place browser applications, UI bundles, static assets, or frontend
  build tooling in this group. Frontend applications remain separate clients.
- Keep experience modules independent from optional providers. BackOffice may
  discover CMS as a UI-composition provider but must not make `gContent/cms` a
  package or startup dependency.
- Child modules must preserve direct target-module authorization and must not
  become duplicate authorities for target-module schemas, permissions,
  topology, runtime activation, or business behavior.
- Use layered configuration and replaceable Nodics services for client-safe
  experience metadata, discovery, routing coordinates, and policies.
