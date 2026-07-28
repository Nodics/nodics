# Media Management

`gFramework/nMedia` is the Nodics framework capability for uploaded files, external media, storage providers, media metadata, reusable media sets, and media references.

It exists because many Nodics capabilities need files, but none of them should own file storage by themselves:

- CMS pages and components need images, documents, and responsive media.
- Product catalogs need product images, documents, videos, and variant galleries.
- Import/export needs uploaded files that become governed import sources.
- Documentation and future websites need image and file assets.
- Axis needs a UI for selecting, uploading, and referencing media, but Axis must not decide storage paths.

## Core Principle

Media is a framework capability. CMS, Product, Import, Documentation, Axis, and custom modules reference media; they do not own binary lifecycle.

Frontend clients may request a media purpose or folder, but the backend resolves the storage provider, base path, generated storage key, checksum, access URL, lifecycle state, and security policy.

## Production Storage Model

Production systems usually do not store static files on the same application process disk. `nMedia` therefore separates:

- storage provider: where bytes live;
- access URL: how authorized users or systems retrieve bytes;
- media metadata: the governed model record that other modules reference;
- folder policy: allowed file types, file size limits, retention, access behavior, and generated key strategy.

The OOTB provider is `local`, intended for development and simple deployments. NAS, S3, Azure Blob, GCP Storage, or CDN-backed providers must implement the same provider contract instead of changing callers.

## Implemented First Slice

This module currently provides the authoritative media contracts, local-provider storage resolution, and secured upload entry point:

- provider-based configuration in `config/properties.js`;
- schemas for media folders, formats, media items, media sets, media set entries, and media references;
- storage key generation that never trusts raw caller paths;
- local provider path/URL resolution;
- route metadata for upload policy discovery;
- secured upload route that consumes nMedia-parsed multipart files, stores bytes through the active nMedia provider, calculates checksum, and persists media metadata;
- secured internal media and media-set reference lookup for domain modules;
- tests that protect provider selection and path traversal boundaries.

The media multipart upload parser belongs to `gFramework/nMedia`. `nRouter` only invokes the body parser handler declared by the route. `nMedia` owns upload limits, parsed `req.files` descriptors, storage, checksum, generated keys, and media records. Axis upload UI is still a separate follow-up work item and must call these backend contracts rather than writing files itself.

## Upload Flow

Browser or API client uploads one file to `/storage/upload` as `multipart/form-data`.

1. `nRouter` selects the route-declared `mediaMultipartUploadBodyParserHandler`.
2. `DefaultMediaMultipartUploadBodyParserHandlerService` validates that the request is multipart.
3. `DefaultMediaMultipartUploadBodyParserHandlerService` applies configured upload limits from `media.upload`.
4. `DefaultMediaMultipartUploadBodyParserHandlerService` parses text fields into `req.body` and the file into a bounded `req.files` descriptor.
5. `nMedia` validates folder, MIME type, extension, and size against `media.upload` and `media.folders`.
6. `nMedia` calculates a checksum, generates a safe provider-relative storage key, and stores the bytes through the active provider.
7. `nMedia` saves the generated media model through the standard schema service.
8. Caller modules store only `mediaCode`, `mediaSetCode`, or `mediaReferenceCode`.

Example multipart fields:

```text
file=<uploaded binary>
folderCode=importSources
formatCode=importFile
mediaCode=optional-business-friendly-code
name=Optional display name
description=Optional description
```

The caller never supplies a local path, cloud key, NAS path, or provider URL as authority.

## Media As A Governed Import Source

Axis and other clients must not upload an import file and then ask `nImport` to
read a browser-provided filesystem path. That would make the client a storage
authority and would bypass the media lifecycle. The correct enterprise flow is:

1. The employee selects a file in Axis.
2. Axis uploads the file to the secured `nMedia` upload route with
   `folderCode=importSources` and `formatCode=importFile`.
3. `nMedia` validates the multipart request, file type, size, folder policy,
   generated key, checksum, provider, and media metadata.
4. Axis receives only a media result such as `mediaCode`, display metadata, and
   safe lifecycle status.
5. Axis calls the governed import API with the selected import definition and
   the `mediaCode`.
6. `nImport` asks `DefaultMediaImportSourceResolverService` for a trusted
   backend import-source descriptor.
7. `nImport` stages the media into an import-run-owned workspace and then runs
   the existing local file import pipeline.

This preserves the boundary:

- `nMedia` owns file upload and provider storage.
- `nImport` owns import execution, staging, parsing, diagnostics, and history.
- Axis owns only the user interaction.

The import descriptor used by `nImport` may include provider-internal
information, but it must remain backend-only. Do not expose local absolute
paths, object-store keys, bucket names, NAS paths, signed URLs, or provider
credentials to Axis or any other browser client.

The nMedia side is intentionally not an import browser route. It is a service
contract used by `nImport`:

- `DefaultMediaImportSourceResolverService` validates that the media item is an
  active import-capable source.
- `DefaultMediaStorageProviderRegistryService.resolveImportSource` delegates to
  the active provider.
- `DefaultLocalMediaStorageProviderService.resolveImportSource` resolves a
  local-development readable descriptor.

The secured browser-facing import route belongs to `nImport` through the system
control plane: `POST /nodics/system/v0/import/media`. That route accepts
`mediaCode`, `definitionCode`, and optional `options.validateOnly`, then uses
nMedia only for trusted backend source resolution.

## Media Sets And Product Galleries

A `mediaSet` is one logical asset made from multiple concrete media files. For
example, a product front-view image can have original, thumbnail, mobile,
desktop, and zoom variants. A CMS banner can have localized or responsive
variants. The caller asks for a media set; rendering code or downstream
services choose the best `mediaSetEntry` for the current placement.

Product-specific meaning is intentionally not stored in `nMedia`. Product owns
relationships such as primary image, thumbnail image, gallery image, swatch,
manual, video, sequence, catalog version, and storefront visibility. Product
should reference `mediaCode` or `mediaSetCode`; it must not own storage keys,
provider selection, generated URLs, or media binary lifecycle.

## Reference Lookup Contract

Domain modules should not query `nMedia` generated CRUD services directly when
they only need to know whether a media item or media set is usable. They should
use the secured internal reference lookup contract.

The lookup accepts `referenceType: MEDIA` or `referenceType: MEDIA_SET` with a
`referenceCode`. It returns a small safe projection that confirms the reference
and exposes only classification fields needed by callers. It does not expose
provider storage keys, local paths, signed URLs, generated delivery URLs, cloud
bucket names, or provider credentials as caller-owned truth.

Product uses this contract before saving product images, thumbnails, galleries,
swatches, videos, manuals, datasheets, or any other Product-owned media
assignment.

## Extension Guidance

To add an S3 provider later:

1. Add a provider service such as `DefaultS3MediaStorageProviderService`.
2. Register it in `media.storage.providers.s3.service`.
3. Keep credentials in secure runtime configuration, not in source.
4. Preserve the same returned descriptor shape as the local provider.
5. Add guarded live-provider tests and deterministic contract tests.

Do not put S3-specific logic into CMS, Product, Import, or Axis.
