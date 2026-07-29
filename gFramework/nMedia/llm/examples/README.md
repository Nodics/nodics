# nMedia Examples

## Safe caller request

```json
{
  "folderCode": "importSources",
  "schemaName": "tenant",
  "enterpriseCode": "default",
  "fileName": "tenant-upload.xlsx",
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "sizeBytes": 20480
}
```

The caller does not provide a filesystem path. `nMedia` chooses the provider,
resolves the provider root, and uses the configured key strategy to generate a
provider-relative key such as
`data/default/default/tenant/2026/07/tenant-upload-july.xlsx`.

The upload response returns the governed media item. Downstream callers should
store or pass `media.code`, not the path:

```json
{
  "code": "tenant-upload-july",
  "providerCode": "local",
  "folderCode": "importSources",
  "formatCode": "importFile",
  "originalFileName": "tenant-upload.xlsx",
  "storedFileName": "tenant-upload-july.xlsx",
  "storageKey": "data/default/default/tenant/2026/07/tenant-upload-july.xlsx",
  "relativePath": "data/default/default/tenant/2026/07/tenant-upload-july.xlsx",
  "fullPath": "/active/server/path/temp/media/data/default/default/tenant/2026/07/tenant-upload-july.xlsx",
  "accessUrl": "/nodics/media/v0/content/tenant-upload-july",
  "checksum": "sha256-value",
  "status": "READY"
}
```

## Local development storage

```js
media: {
    storage: {
        defaultProvider: 'local',
        providers: {
            local: {
                enabled: true,
                service: 'DefaultLocalMediaStorageProviderService',
                basePath: '',
                fallbackRelativeBasePath: 'temp/media',
                baseUrl: '/nodics/media/v0/content'
            }
        }
    }
}
```

With empty `basePath`, the local provider writes under the active server path:

```text
NODICS.getServerPath()/temp/media/{purpose}/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}
```

For local mono-server development, that becomes:

```text
startio/envs/startioLocal/monoServer/temp/media/data/default/default/tenant/2026/07/tenant-upload-july.xlsx
```

Do not use a Nodics repository-root `runtime/` directory for uploaded files.

## Purpose-based media paths

The first storage-key segment is controlled by folder policy:

```text
importSources -> data
cmsAssets -> content
productAssets -> products
default -> utils
```

Examples:

```text
data/default/default/tenant/2026/07/defaultTenantCsvData.csv
content/default/default/cmsComponent/2026/07/home-banner.png
products/default/electronics/product/2026/07/iphone-gallery.webp
utils/default/default/document/2026/07/kyc-proof.pdf
```

Partners can change purpose names through `media.folders.<folderCode>.storagePrefix`
or replace the key strategy when a deployment needs a different path shape.

## Absolute local or NAS-style storage

Use this only when operations owns the path, permissions, backups, and cleanup:

```js
media: {
    storage: {
        defaultProvider: 'local',
        providers: {
            local: {
                basePath: '/var/lib/nodics/media',
                baseUrl: 'https://media.company.example'
            }
        }
    }
}
```

For a future NAS provider, keep the same caller contract and change only the
provider configuration and provider implementation:

```js
media: {
    storage: {
        defaultProvider: 'nas',
        providers: {
            nas: {
                enabled: true,
                service: 'DefaultNasMediaStorageProviderService',
                basePath: '/mnt/nodics-media',
                baseUrl: 'https://media.company.example'
            }
        }
    }
}
```

## Cloud object storage configuration shape

The cloud providers are placeholders until their provider services are
implemented. Their configuration shape documents the intended extension point;
it is not a license to put cloud logic into Axis, CMS, Product, or nImport.

```js
media: {
    storage: {
        defaultProvider: 's3',
        providers: {
            s3: {
                enabled: true,
                service: 'DefaultS3MediaStorageProviderService',
                bucket: 'company-nodics-media',
                region: 'ap-south-1',
                baseUrl: 'https://cdn.company.example'
            },
            azureBlob: {
                enabled: false,
                service: 'DefaultAzureBlobMediaStorageProviderService',
                container: 'nodics-media',
                baseUrl: 'https://cdn.company.example'
            },
            gcpStorage: {
                enabled: false,
                service: 'DefaultGcpMediaStorageProviderService',
                bucket: 'company-nodics-media',
                baseUrl: 'https://cdn.company.example'
            }
        }
    }
}
```

Credentials must come from secure runtime configuration, IAM, managed identity,
workload identity, or another provider-owned secret lookup. Never put provider
secrets in frontend `.env`, source-controlled sample files, package metadata,
or generated documentation.

## Custom key strategy mapping

If a partner wants product media under a different path shape, add a strategy
service and map only the relevant folder:

```js
media: {
    storage: {
        keyStrategies: {
            productAssets: 'productCatalogMedia'
        },
        keyStrategyServices: {
            productCatalogMedia: 'CustomProductCatalogMediaKeyStrategyService'
        }
    }
}
```

The custom service must still return a provider-relative key and must reject
traversal, absolute paths, URL-like keys, and unsafe extension behavior.

## Upload request

```text
POST /nodics/media/v0/storage/upload
Content-Type: multipart/form-data

file=<tenant-upload.xlsx>
folderCode=importSources
formatCode=importFile
schemaName=tenant
enterpriseCode=default
name=Tenant import source
```

`nRouter` invokes the nMedia route-declared parser. `nMedia` parses and
validates the multipart request, stores the file through the configured
provider, creates a checksum, and persists the media record.

## Import-file upload followed by import execution

```text
POST /nodics/media/v0/storage/upload
Content-Type: multipart/form-data

file=<tenant-upload.xlsx>
folderCode=importSources
formatCode=importFile
schemaName=tenant
enterpriseCode=default
name=Tenant import source for July catalog refresh
```

The response gives Axis a media identity such as:

```json
{
  "code": "tenant-upload-july",
  "folderCode": "importSources",
  "formatCode": "importFile",
  "status": "READY",
  "checksum": "..."
}
```

Axis may display that result and ask the employee to continue. The next request
must go to the import authority with the media identity, not with a storage
path:

```json
{
  "source": {
    "type": "MEDIA",
    "mediaCode": "tenant-upload-july"
  },
  "definition": "tenantProfileImport",
  "importFinalizeData": true
}
```

`nImport` resolves the trusted media descriptor through `nMedia`, copies or
streams the file into an import-run-owned staging directory, and then executes
the existing file import pipeline. Axis never sees provider paths.

## Public media delivery

Public CMS or Product media should be displayed through the nMedia delivery URL:

```text
GET /nodics/media/v0/content/{mediaCode}
```

The route reloads the media model, checks delivery policy, resolves the
provider-owned file on the backend, and streams bytes only when allowed. The
browser receives content, not the provider root or storage key.

`PUBLIC` media is deliverable when `media.delivery.publicAccessEnabled` is true.
`SIGNED` and `PRIVATE` media are deliberately not implemented as flag-only
behavior; add a real signed-token or authorization policy before enabling them.

## Unsafe request

```json
{
  "folderCode": "importSources",
  "storageKey": "../../server.js"
}
```

This must be rejected. Caller-provided storage keys are not authoritative unless an internal trusted service explicitly opts into a governed override.
