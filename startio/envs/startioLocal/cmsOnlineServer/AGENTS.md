# cmsOnlineServer Agent Contract

## Inheritance

- Follow the root Nodics AI contract: `../../../../AGENTS.md`.
- Follow global guidance: `../../../../gSetup/llm/README.md`.

## Online Runtime Rules

- Keep this process non-versioned with `publishEnabled: false`.
- Keep its database authority separate from Staged CMS.
- Do not activate WCMS authoring or approval modules here.
- Accept publication changes only through authenticated target APIs and preserve
  manifest integrity, idempotency, pointer CAS, tenant scope, and rollback.
- Extend behavior through later project/environment/server/node layers without
  modifying reusable CMS, workflow, or nPublish authority paths.
