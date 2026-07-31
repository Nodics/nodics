# nMedia Agent Contract

This file gives AI coding agents mandatory guidance for the Nodics framework media capability.

## Inheritance

- Follow the root Nodics AI contract: `../../AGENTS.md`.
- Follow the framework contract: `../AGENTS.md`.
- Follow global AI/development guidance: `../../gSetup/llm/README.md`.

## Ownership

`gFramework/nMedia` is the framework authority for media lifecycle:

- media metadata;
- media folders and formats;
- storage provider selection;
- backend-owned storage key/path generation;
- media set and variant grouping;
- media references that other modules can use without owning files;
- media access, stream, lifecycle, and cleanup contracts.

Every successful upload must create a governed `media` model record. The record
must retain the original filename, generated stored filename, provider code,
folder/format, `storageKey`, readable relative path, backend full path or
provider locator, access URL when resolvable, MIME type, extension, file size,
checksum, access mode, and lifecycle status. Downstream modules process media
through `media.code`, not raw paths.

`nMedia` does not own product, CMS, import, documentation, or storefront business meaning. Those modules reference media or media sets when they need assets.

Product-specific relationships such as primary image, thumbnail, gallery order,
swatch image, product manual, or product video belong to the Product/Catalog
owning module. `nMedia` owns the reusable set of files and variants; Product
owns why that set is attached to a product.

## Non-Negotiable Boundaries

- Do not let frontend clients provide raw filesystem paths, NAS paths, cloud bucket paths, or public URLs as authoritative storage locations.
- Do not duplicate media storage under CMS, Product, Import, Documentation, Axis, or project modules.
- Do not add a provider directly to a caller module. Add a provider implementation behind the `nMedia` provider contract.
- Do not place production provider credentials in `package.json`, sample data, tests, generated docs, or frontend repositories.
- Do not add a new upload parser or router-level body parser from inside `nMedia`. HTTP request parsing belongs to `gFramework/nRouter`; `nMedia` may consume parsed file descriptors.
- Domain modules must use the `nMedia` reference lookup contract when they need to validate a `mediaCode` or `mediaSetCode`; they must not read generated media CRUD services directly as a shortcut.

## Configuration Contract

Reusable defaults belong in `gFramework/nMedia/config/properties.js`.

Project, environment, server, node, tenant, or customer layers may override:

- active/default storage provider;
- provider enablement;
- provider base path, base URL, and internal/private URL policy;
- root fallback path for local runtime storage;
- folder policy;
- folder-to-key-strategy mapping and key strategy service mapping;
- allowed extensions and MIME types;
- maximum file size;
- generated key strategy;
- retention and cleanup behavior.
- reference lookup active status policies for media items and media sets.

Later layers must override only the values they intentionally change. Do not copy the full OOTB provider configuration into server or environment properties as placeholders.

If `media.storage.providers.local.basePath` is empty, local storage must fall
back to the active server path plus `fallbackRelativeBasePath` such as
`temp/media`. Do not create a repository-root `runtime/` directory. Provider
services own storage mechanics only; key strategy services own logical path
shape such as `{purpose}/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`.
The OOTB purpose prefix is folder-policy driven: `data` for import sources,
`content` for CMS assets, `products` for product assets, and `utils` for
general media.

For import uploads, Axis must collect the business destination first, then the
target model/schema, then the file. The selected schema comes from the governed
model picker and must be passed as upload context. Never infer the target
schema from the uploaded file name.

Provider-specific configuration rules:

- local storage is implemented and should use server-path fallback for local
  development unless a trusted layer overrides it;
- NAS, S3, Azure Blob, Google Cloud Storage, FTP, SFTP, CDN, or partner storage
  integrations must be provider services behind `nMedia`;
- credentials, connection strings, certificates, access keys, SAS tokens,
  private keys, bucket names that are not safe to disclose, and signed URLs
  must stay backend-only;
- public callers may receive a safe media identity and delivery descriptor
  only through an nMedia-owned contract;
- media delivery must go through `/nodics/media/v0/content/{mediaCode}` or a
  later nMedia-owned delivery route. Never expose local filesystem paths,
  provider storage keys, object-store URLs, or signed URLs as caller-owned
  authority;
- public delivery may serve only policy-allowed `PUBLIC` media. `SIGNED` and
  `PRIVATE` delivery must remain blocked until a real nMedia access policy is
  implemented and tested;
- storage provider changes must not require changes in Axis, CMS, Product,
  nImport, Documentation, or project modules.

## Implementation Order

For every media change:

1. Reuse the `nMedia` provider, folder, format, media, media set, and reference contracts.
2. Customize behavior through `properties.js`, provider services, schema overrides, or later-layer services.
3. Create a new schema/service/provider only after checking that existing contracts cannot express the requirement.

## Documentation and Test Expectations

Every media lifecycle change must update:

- `README.md` for human entry guidance;
- `llm/contracts/README.md` for AI/developer rules;
- focused tests for provider resolution, storage key safety, folder policy, and forbidden path behavior;
- canonical documentation content when the behavior is visible to administrators, developers, operators, business users, or Axis.

Tests must cover positive, negative, boundary, contract, integration-ready, and regression behavior without relying on production cloud services unless a live-provider test is explicitly marked and guarded.
