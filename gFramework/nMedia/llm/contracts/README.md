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
- default key strategy, folder-to-strategy mapping, and strategy service mapping;
- folder policy;
- allowed MIME types and extensions;
- maximum size;
- checksum behavior;
- lifecycle retention.

Multipart media upload limits belong to `gFramework/nMedia` under
`media.upload`. Media business/file policy belongs to `gFramework/nMedia`
under `media.upload` and `media.folders`.

The OOTB local provider default leaves `media.storage.providers.local.basePath`
empty and uses `fallbackRelativeBasePath: 'temp/media'`. That means local upload
bytes resolve under the active `NODICS.getServerPath()` by default, for example
`monoServer/temp/media`. Configured absolute paths win for NAS or other
deployment-owned roots. Configured relative paths still resolve under the
active server path. Do not use or recreate a Nodics repository-root `runtime/`
directory for uploads.

Provider root resolution and storage key strategy are separate authorities.
Providers decide where/how bytes are stored. Key strategies decide the logical
provider-relative path. The OOTB strategy service is
`DefaultTenantEnterpriseSchemaDateMediaKeyStrategyService`, selected through
`media.storage.keyStrategies` and `media.storage.keyStrategyServices`, and it
generates:

```text
{purpose}/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}
```

The first segment is a folder-owned purpose prefix. OOTB mappings are
`importSources -> data`, `cmsAssets -> content`, `productAssets -> products`,
and `default -> utils`.

Later layers may map a folder or request to another strategy by changing the
smallest relevant key-strategy setting. They must not fork provider services,
caller modules, Axis, or nImport just to change path shape.

Server and environment configuration should contain only actual deployment
differences. Do not copy the complete `media` block into generated servers.

## Storage Root Resolution Contract

Storage root resolution is provider-owned backend behavior. Frontend clients,
caller modules, import definitions, CMS components, Product records, and
documentation content must not provide root filesystem paths as authority.

For the local provider, root resolution is:

1. configured absolute `basePath` wins;
2. configured relative `basePath` resolves under `NODICS.getServerPath()`;
3. empty `basePath` falls back to
   `NODICS.getServerPath() + '/' + fallbackRelativeBasePath`.

The OOTB fallback is `temp/media`. A local mono-server upload therefore belongs
under the active server runtime folder, not under a repository-root `runtime/`
folder.

This rule exists to prevent three common failures:

- source repositories accidentally containing uploaded runtime files;
- two environments sharing a flat local upload directory;
- frontend or import code becoming a second storage authority.

## Storage Key Strategy Contract

The default key strategy is `tenantEnterpriseSchemaDateMedia`.

Key strategies must:

- produce provider-relative keys only;
- reject traversal, absolute paths, URL-like paths, and unsafe extension
  behavior;
- use backend-known tenant and enterprise context;
- use caller-selected target schema only when it comes from a governed backend
  model selection, not from the uploaded filename;
- be replaceable through `media.storage.keyStrategies` and
  `media.storage.keyStrategyServices`.

Axis file import must follow this sequence:

1. employee selects target enterprise;
2. backend resolves the technical tenant from enterprise configuration;
3. employee selects the target model/schema from that authorized tenant/module
   scope;
4. employee chooses and uploads the file;
5. Axis passes selected schema context to nMedia;
6. nMedia generates the storage key through the configured strategy;
7. nImport later consumes only the `mediaCode`.

Do not infer target schema from a file name. File names may help display or
suggest choices later, but they are not authority.

## Media Record Contract

Every successful upload must persist a `media` item before another module
processes the file. The persisted media item is the governed handle for the
file and must include:

- `code`, which downstream modules use as the processing handle;
- `originalFileName`, preserving the browser/API supplied filename for audit
  and business display;
- `storedFileName`, preserving the backend-generated stored filename;
- `providerCode`, `folderCode`, and `formatCode`;
- `storageKey`, the provider-relative storage authority;
- `relativePath`, a readable alias of the provider-relative path;
- `fullPath`, a backend-resolved full local path or provider locator for
  governed processing;
- `url` and `accessUrl` when provider policy can resolve an access URL;
- `mimeType`, `extension`, `sizeBytes`, `checksum`,
  `checksumAlgorithm`, `access`, and `status`.

Product, CMS, Documentation, Import, Axis, and custom modules must store or
pass `media.code`, `mediaSetCode`, or `mediaReferenceCode`. They must not copy
raw filesystem paths, object-store keys, bucket names, provider URLs,
credentials, or provider-specific metadata as their own authority.

## Provider Configuration Contract

Provider implementations may be local filesystem, NAS, S3, Azure Blob, Google
Cloud Storage, FTP/SFTP, CDN-backed object storage, or another enterprise
storage provider. They must all stay behind the same nMedia provider boundary.

Provider configuration rules:

- reusable defaults belong in `gFramework/nMedia/config/properties.js`;
- server/environment layers override only actual deployment values;
- credentials never belong in source, generated docs, package metadata, sample
  data, frontend `.env`, or browser state;
- provider descriptors returned to public callers must not expose local
  absolute paths, bucket names, object keys, signed URLs, connection strings,
  private keys, certificates, SAS tokens, or cloud credentials;
- live-provider tests must be guarded and must not run without explicit local
  configuration;
- deterministic contract tests must prove behavior without requiring cloud
  services.

Local provider:

- implemented OOTB;
- use empty `basePath` plus `fallbackRelativeBasePath: 'temp/media'` for local
  development;
- use a relative configured `basePath` for server-owned runtime subfolders;
- use an absolute configured `basePath` only for operations-owned paths.

NAS provider:

- should behave like local storage over a shared mount;
- must verify multi-node access, permissions, backup, locking, partial writes,
  and private/public URL behavior.

S3 provider:

- must keep AWS credentials in IAM/secret runtime mechanisms;
- must not expose raw bucket keys as caller authority;
- should support private object access and future signed URL/CDN delivery
  contracts.

Azure Blob provider:

- must keep connection strings, account keys, and SAS tokens backend-only;
- should support managed identity or secure secret lookup;
- must normalize returned descriptors to the nMedia contract.

Google Cloud Storage provider:

- must use workload identity, service account, or governed secret lookup;
- must not expose credentials or object paths to Axis as configuration;
- must normalize returned descriptors to the nMedia contract.

FTP/SFTP provider or adapter:

- must own connection details, credential/certificate lookup, retry,
  idempotency, partial file handling, archive/quarantine behavior, and
  diagnostics;
- must not let Axis know host credentials, private keys, remote folders, or raw
  file paths.

## Delivery Access Contract

Media delivery is an nMedia-owned access decision, not a storage-provider
shortcut. A media item may store an `accessUrl`, but that URL must resolve to a
media-code based nMedia endpoint such as:

```text
/nodics/media/v0/content/{mediaCode}
```

The delivery route must:

- validate the media code format;
- load exactly one active media model through the schema service;
- honor `media.delivery.enabled` and `media.delivery.allowedStatuses`;
- allow direct streaming only for policy-approved access modes;
- resolve provider-owned file descriptors on the backend;
- stream bytes without exposing local paths, object keys, bucket names, signed
  URLs, provider credentials, or absolute server paths as caller-owned data.

OOTB behavior is intentionally strict:

- `PUBLIC` media can be streamed when `publicAccessEnabled` is true;
- `SIGNED` media must remain blocked until a signed-token policy validates
  expiry, signature, audience, tenant, and media code;
- `PRIVATE` media must remain blocked until a private authorization policy
  validates the authenticated principal and business permission.

Do not implement signed or private delivery by simply enabling a flag. Add the
real policy service, tests for expired/forged/wrong-audience tokens or
unauthorized users, and documentation for the customization point.

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
