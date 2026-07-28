# nMedia Examples

## Safe caller request

```json
{
  "folderCode": "importSources",
  "fileName": "tenant-upload.xlsx",
  "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "sizeBytes": 20480
}
```

The caller does not provide a filesystem path. `nMedia` chooses the provider and generated key.

## Upload request

```text
POST /nodics/media/v0/storage/upload
Content-Type: multipart/form-data

file=<tenant-upload.xlsx>
folderCode=importSources
formatCode=importFile
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

## Unsafe request

```json
{
  "folderCode": "importSources",
  "storageKey": "../../server.js"
}
```

This must be rejected. Caller-provided storage keys are not authoritative unless an internal trusted service explicitly opts into a governed override.
