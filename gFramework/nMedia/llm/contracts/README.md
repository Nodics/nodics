# nMedia Contracts

## Media Lifecycle Contract

Media lifecycle is backend-owned and provider-neutral.

1. A caller uploads a file or asks for media storage by purpose/folder and file descriptor.
2. `nRouter` selects the route-declared body parser handler.
3. `nMedia` owns multipart upload parsing for media routes and produces bounded `req.files` descriptors.
4. `nMedia` validates the descriptor against folder and upload policy.
5. `nMedia` selects the active configured provider.
6. `nMedia` generates the storage key; raw caller paths are rejected.
7. The provider writes or resolves the file location.
8. `nMedia` calculates checksum and creates or updates the media model.
9. Caller modules store only `mediaCode`, `mediaSetCode`, or `mediaReferenceCode`.

`nMedia` must own upload-specific multipart parsing because upload limits,
file descriptors, and media intake semantics are part of the media lifecycle.
`nRouter` must not become a file/media upload framework; it only invokes the
handler declared by the route.

## Media Set Contract

A media set groups multiple concrete media files into one logical asset. Use it
for responsive images, localized assets, product galleries, CMS banners,
documents with previews, or later transformed media.

`nMedia` owns:

- the media set record;
- the entry that links a concrete media item to the set;
- format, locale, role, dimensions, access, and lifecycle metadata needed to
  select or validate variants.

Caller modules own business meaning. For example, Product owns primary image,
thumbnail image, gallery sequence, swatch, manual, video, product/catalog
visibility, and publishing behavior. CMS owns page/component placement.
Import owns import source execution. These modules reference a `mediaSetCode`
or `mediaCode`; they do not own storage provider state.

## Reference Lookup Contract

`nMedia` exposes a secured internal reference lookup for modules that need to
validate `mediaCode` or `mediaSetCode`.

Caller modules send `referenceType` and `referenceCode`; they receive only a
bounded validation projection. The projection must not expose local paths,
provider storage keys, signed URLs, generated delivery URLs, cloud bucket
names, or provider credentials as caller-owned data.

Use this contract from Product, CMS, Import, Documentation, Axis, or project
modules before saving domain-owned media assignments. Do not bypass it by
calling generated media CRUD services directly from the caller module.

## Configuration Contract

All deployable behavior must be layered configuration:

- provider enablement;
- provider base path and base URL;
- private/public delivery mode;
- key strategy;
- folder policy;
- allowed MIME types and extensions;
- maximum size;
- checksum behavior;
- lifecycle retention.

Multipart media upload limits belong to `gFramework/nMedia` under
`media.upload`. Media business/file policy belongs to `gFramework/nMedia`
under `media.upload` and `media.folders`.

Server and environment configuration should contain only actual deployment differences. Do not copy the complete `media` block into generated servers.

## Provider Contract

Every provider service must support:

- `resolveLocation(request)`;
- `store(request)`;
- `remove(request)`;
- safe generated keys;
- no secret leakage in returned descriptors;
- deterministic tests without live provider dependency;
- guarded live tests for production provider readiness.

## Import/Export Interaction

Import/export may consume a media reference as an input source. Import/export
must not parse frontend-uploaded paths or duplicate media storage. `nImport`
must ask `nMedia` to resolve a trusted server-side descriptor before running
existing file import pipelines.

Mandatory rules:

- Axis or another frontend uploads import files only through `nMedia`.
- Axis passes `mediaCode` or another nMedia-owned reference to `nImport`; it
  never passes `/tmp`, a NAS path, a cloud object key, a bucket name, or a
  filesystem path.
- `nMedia` may expose a backend-only import-source descriptor to `nImport`, but
  public reference lookup must continue to hide provider storage details.
- `nImport` owns import-run staging and diagnostics after the trusted media
  descriptor is accepted.
- A project-specific file-import screen must compose these two authorities; it
  must not create its own upload parser, storage table, or direct persistence
  path.
