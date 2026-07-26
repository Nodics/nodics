# import AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nData/nImport/import`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Versioned content packs

- Reuse `DefaultContentPackService` and `DefaultImportService`; never add a
  client, CMS, BackOffice, Wiki, or project-specific parallel importer.
- Keep content packs disabled by default and enable them through later-layer
  `data.contentPacks` configuration.
- Validate immutable version, contract version, every generated-file checksum,
  aggregate release checksum, contained paths, tenant scope and update policy.
- Include content-pack code, immutable version, and release checksum in import
  duplicate fingerprints so update releases remain distinct and retry-safe.
- Copy local releases into server-owned staging before local import because
  that lifecycle moves files.
- Treat committed content-pack data and its manifest as the distribution
  artifact. Consumer builds, `.work` copies, and caller-selected filesystem
  paths are outside the governed installation contract.
- System owns secured HTTP exposure; nImport owns execution and run history;
  Axis owns only status/action presentation.
- Stable-code `saveAll` imports create and update records. Do not claim physical
  removal, catalog activation or publication until composed through CMS,
  Workflow and nPublish authorities.
