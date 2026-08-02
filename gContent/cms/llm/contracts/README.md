# cms AI Contracts

This folder contains module-specific AI/developer contracts for `gContent/cms`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## WCMS authoring model

- `cms` owns the reusable WCMS authoring schemas. `wcms` owns
  workflow-enabled CMS behavior and should not duplicate plain authoring
  entity schemas.
- `cmsTypeCode` remains the canonical page/component type authority.
  Do not add parallel `cmsPageType` or `cmsComponentType` schemas.
- `cmsComponentDetail` remains the generic component-placement relation for
  page-to-component and component-to-component placement. Do not introduce
  `cmsComponentPlacement` unless a migration deliberately renames the existing
  contract.
- `cmsSlotDefinition` remains the template slot authority for slot
  cardinality, allowed component types, and allowed component type groups.
  Do not add a duplicate template-slot relation without a planned migration.
- Renderer mappings must stay logical and declarative. CMS can return renderer
  keys and contract versions, never executable frontend code, URLs, or local
  paths.
- Axis and BackOffice pages must consume backend navigation, help,
  documentation, schema/list/detail/query, and renderer metadata instead of
  hardcoding page-specific CRUD experiences.
- Validate authoring model changes with
  `node gContent/cms/test/cmsWcmsAuthoringSchemaContract.test.js`.
