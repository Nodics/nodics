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

## Media-backed file import

- Axis and other frontend clients must upload files through `gFramework/nMedia`
  before starting a browser-facing file import. This is the reusable import
  intake path; do not add an nImport-specific multipart upload route.
- The frontend may pass `source.type = MEDIA` and `source.mediaCode` to the
  import capability. It must not pass raw local paths, temporary folders, cloud
  object keys, NAS paths, bucket names, provider URLs, or credentials.
- `nMedia` owns media upload semantics, storage provider selection, storage
  keys, checksum, media lifecycle, and backend-only storage descriptors. The
  route/body-parser extension point remains framework-owned and must not be
  duplicated inside nImport.
- `nImport` owns generic media import target acceptance, optional import
  templates, media-source acceptance, import-run staging, format parsing,
  finalization, target dispatch, diagnostics, and run history.
- Import run history may be filtered by `mediaCode`; this is translated to the
  sanitized source name `media:{mediaCode}` and must stay read-only for
  BackOffice/Axis media-linkage views.
- The secured media-backed import route is
  `POST /nodics/import/v0/media`. It accepts `mediaCode` plus either a
  generic `moduleName`/`schemaName` target or an optional future
  `definitionCode` template, and optional `options.validateOnly`.
- Generic media import is schema-first: Axis may select an authorized target
  model from Workbench metadata, but nImport generates the runtime header and
  executes validation/dispatch.
- Import templates may later map recurring business import choices to module
  name, schema or index target, operation, tenant scope, data-file prefix, query
  mapping, optional macros, options, and allowed file extensions. Templates are
  conveniences over the same route, not a required authority for generic file
  import.
- Media import execution generates a run-local header from the generic target
  or optional template. The generated header is temporary runtime material, not
  source authority.
- A media-backed import implementation must stage the media into an
  import-run-owned workspace before invoking existing local file import
  pipelines, because local import processing can move processed files.
- Validation-only media import may resolve media, validate definition policy,
  generate the temporary header, stage the source file, run the standard local
  initializer, parse rows, and prepare finalized records inside the run
  workspace. It must stop before `processDataImportPipeline`; it must not
  dispatch schema/search writes or mark the import installed.
- `DefaultMediaImportSourceStagingService` is the import-owned staging
  primitive. It may call nMedia-owned source resolution, but it must not inspect
  provider configuration directly or expose backend source paths in public
  projections.
- Public API responses and Axis state must not expose provider secrets, local
  absolute paths, object-store keys, signed URLs, or storage implementation
  details.
- Project customization should add headers, processors, optional import templates,
  media folder policy, provider services, or remote adapters through later
  layers. Do not create a parallel upload table, parser, importer, or direct
  persistence path.
