# nMedia Contracts

## Media Lifecycle Contract

Media lifecycle is backend-owned and provider-neutral.

1. A caller uploads a file or asks for media storage by purpose/folder and file descriptor.
2. `nRouter` selects the route-declared body parser handler.
3. The configured parser produces bounded file descriptors for the route.
4. `nMedia` validates the descriptor against folder and upload policy.
5. `nMedia` selects the active configured provider.
6. `nMedia` generates the storage key; raw caller paths are rejected.
7. The provider writes or resolves the file location.
8. `nMedia` calculates checksum and creates or updates the media model.
9. Caller modules store only `mediaCode`, `mediaSetCode`, or `mediaReferenceCode`.

`nMedia` owns media intake semantics, upload policy, storage, checksum,
provider descriptors, and media records. `nRouter` owns the route/body-parser
extension point and must not learn media business meaning.

## Media Download Contract

`nMedia` must not own a parallel attachment-download response path.

1. The media download route is secured by router/auth configuration.
2. `nMedia` resolves the media code, validates access, and returns a bounded
   file descriptor.
3. The route uses `fileDownloadResponseHandler` from `gFramework/nRouter`.
4. The shared handler owns HTTP attachment headers, filename sanitization, and
   safe transfer-error responses.

Inline content delivery may use an nMedia-specific content response handler
because inline delivery policy and content-disposition behavior are media
specific. Attachment downloads must reuse the router handler.

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

Media folder management is nMedia-owned and configuration-first. The generated
`mediaFolder` model may be used for discovery, records, seed/audit workflows,
and Schema Workbench visibility, but live upload validation reads effective
`media.folders` policy through `DefaultMediaStoragePolicyService`. Clients must
not treat generic model CRUD as live upload-policy authority unless an approved
nMedia governance workflow synchronizes those records into effective
configuration.

The secured folder-policy mutation routes are:

- `PUT /nodics/media/v0/folders/policy` for create;
- `PATCH /nodics/media/v0/folders/policy/{folderCode}` for update;
- `POST /nodics/media/v0/folders/policy/{folderCode}/activate`;
- `POST /nodics/media/v0/folders/policy/{folderCode}/deactivate`.

All require `media.folder.policy.manage`. They may change only bounded policy
fields: code/name/description on create, provider-relative `storagePrefix`,
`access`, extension/MIME allow-lists, maximum size, retention, and active
status. They must reject absolute paths, traversal, URLs, provider descriptors,
credentials, signed URLs, and any value that lets a client become storage
authority. Inactive folders must be rejected for new uploads.

The secured format-policy mutation routes are:

- `PUT /nodics/media/v0/formats/policy` for create;
- `PATCH /nodics/media/v0/formats/policy/{formatCode}` for update;
- `POST /nodics/media/v0/formats/policy/{formatCode}/activate`;
- `POST /nodics/media/v0/formats/policy/{formatCode}/deactivate`.

All require `media.format.policy.manage`. Effective format authority is
`media.formats` plus `DefaultMediaStoragePolicyService`; generic
`mediaFormat` model CRUD is discovery/audit/workbench support unless an
approved nMedia workflow synchronizes it into effective configuration. Uploads
must reject inactive or unknown formats.

The secured media-set entry mutation routes are:

- `POST /nodics/media/v0/sets/{mediaSetCode}/entries`;
- `PATCH /nodics/media/v0/sets/{mediaSetCode}/entries/{entryCode}`;
- `DELETE /nodics/media/v0/sets/{mediaSetCode}/entries/{entryCode}`;
- `POST /nodics/media/v0/sets/{mediaSetCode}/entries/reorder`;
- `POST /nodics/media/v0/sets/{mediaSetCode}/entries/{entryCode}/primary`.

All require `media.set.manage`. These operations manage reusable
`mediaSetEntry` membership, order, primary selection, fallback, locale,
channel, device, breakpoint, role, dimensions, and lifecycle. They must not
mutate Product, CMS, import, export, or customer business records. Business
owners reference `mediaCode`/`mediaSetCode` and keep their own publishing,
placement, merchandising, and lifecycle authority.

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
`importSources -> data/import`, `exportFiles -> data/export`,
`cmsAssets -> media/content`, `productAssets -> media/product`, and
`default -> media/utility`.

The data import/export split is intentional. Single-schema import files live
under `data/import/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`;
single-schema generated export files live under
`data/export/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`.
Multi-schema aggregated export paths are a separate future contract and should
not be inferred by callers.

Business media purpose paths are similarly explicit:
`media/product/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`,
`media/content/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`,
and
`media/utility/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}`.

Later layers may map a folder or request to another strategy by changing the
smallest relevant key-strategy setting. They must not fork provider services,
caller modules, Axis, or nImport just to change path shape.

Server and environment configuration should contain only actual deployment
differences. Do not copy the complete `media` block into generated servers.

## Media Source Context Contract

`nMedia` publishes media source context metadata so clients such as Axis can
render business-facing source types without becoming the authority for media
folder, format, retention, or upload eligibility.

The default context descriptors are configuration-backed under
`media.contexts`. Each context declares:

- stable context code and business label;
- backend-owned source type and compatibility aliases;
- default and allowed folder codes;
- default and allowed format codes;
- default upload module/schema hints when relevant;
- whether target model/schema selection is required;
- whether manual upload is allowed;
- route template text for user explanation.

The secured route is:

```text
GET /nodics/media/v0/contexts
```

It is exposed through `mediaManagement` with permission `media.context.view`.
The response is a safe projection only. It may include source type, aliases,
folder codes, storage prefixes, access mode, retention, allowed extensions,
allowed MIME types, maximum upload size, checksum algorithm, source labels, and
manual-upload flags. Axis should use the backend-published `sourceType`, `code`,
and `aliases` instead of regex or browser-owned source-type inference whenever
this contract is available. It must not include provider credentials, provider
descriptors, storage keys, full paths, object-store keys, bucket names, signed
URLs, or any value that would let a client become storage authority.

OOTB contexts:

- `dataImports`: manual upload enabled, default folder `importSources`,
  default format `importFile`, target schema required.
- `dataExports`: manual upload disabled, default folder `exportFiles`, default
  format `exportFile`; generated by export workflows.
- `productMedia`: manual upload enabled, default folder `productAssets`.
- `contentMedia`: manual upload enabled, default folder `cmsAssets`.
- `utilityMedia`: manual upload enabled, default folder `default`.

Later project, environment, server, node, tenant, or customer layers should
customize contexts by overriding only the relevant `media.contexts` entries or
by overriding `DefaultMediaStoragePolicyService` in a later module. They must
not duplicate this mapping in Axis, CMS, Product, nImport, or nExport.

Storage provider summary is exposed as a safe operator projection:

```text
GET /nodics/media/v0/storage/providers/summary
```

It is exposed through `mediaManagement` with permission
`media.storage.policy.view`. The response may include active provider code,
provider type, active/enabled flags, coarse provider health, configured key
strategy name, and delivery mode. It must hide provider credentials, local or
NAS absolute paths, object-store buckets or keys, certificates, signed URL
secrets, and raw storage descriptors. Axis may display this summary as an
operations aid, but it must not become a provider configuration console or a
second storage authority.

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

Media preview and inline delivery must use the secured content endpoint with an
authenticated caller. Private operational media, including generated export
files, may also use the secured download endpoint when attachment semantics are
required:

```text
/nodics/media/v0/download/{mediaCode}
```

Both endpoints are media-code based. They require an authenticated caller, apply
the nMedia delivery policy, and return bytes without exposing local paths or
provider storage keys. The download endpoint additionally returns an attachment
disposition so BackOffice clients can save files.

The delivery and download routes must:

- validate the media code format;
- load exactly one active media model through the schema service;
- honor `media.delivery.enabled` and `media.delivery.allowedStatuses`;
- allow direct streaming only for policy-approved access modes;
- resolve provider-owned file descriptors on the backend;
- stream bytes without exposing local paths, object keys, bucket names, signed
  URLs, provider credentials, or absolute server paths as caller-owned data.

OOTB behavior is intentionally strict:

- inline media content is streamed only through secured nMedia routes;
- `PUBLIC` is a media visibility value, not anonymous internet access;
- public website/CDN delivery requires a separate explicit public or signed
  route with tenant, enterprise, lifecycle, and token policy;
- `SIGNED` media must remain blocked until a signed-token policy validates
  expiry, signature, audience, tenant, and media code;
- `PRIVATE` media may be streamed or downloaded only through secured routes by
  an authenticated principal with the route permission. Richer tenant,
  enterprise, usage, or owner checks belong in the nMedia policy layer or a project
  override.

Do not implement signed delivery or domain-specific private delivery by simply
enabling a flag. Add the real policy service, tests for
expired/forged/wrong-audience tokens or unauthorized users, and documentation
for the customization point.

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
