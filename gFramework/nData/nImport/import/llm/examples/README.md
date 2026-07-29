# import AI Examples

This folder contains examples that help AI agents and developers work correctly inside the `gFramework/nData/nImport/import` module boundary.

Prefer small examples that show proper layered customization, configuration overrides, service extension, schema/router changes, tests, and documentation updates without modifying unrelated Nodics code.

## Axis file import example

The Back Office file import journey is a composition of two backend
capabilities.

First, upload through media:

```text
POST /nodics/media/v0/storage/upload
Content-Type: multipart/form-data

file=<supplier-products.xlsx>
folderCode=importSources
formatCode=importFile
name=Supplier products July upload
```

Then start import with a media reference:

```json
{
  "mediaCode": "supplier-products-july",
  "definitionCode": "supplierProductImport",
  "options": {
    "validateOnly": true
  },
  "importFinalizeData": true
}
```

Install or update uses the same route without validation-only mode:

```text
POST /nodics/import/v0/media
Authorization: Bearer <employee-token>
Content-Type: application/json

{
  "mediaCode": "supplier-products-july",
  "definitionCode": "supplierProductImport",
  "importFinalizeData": true
}
```

Do not design the route like this for a browser-facing workflow:

```json
{
  "inputPath": {
    "rootPath": "/tmp/browser-uploaded-file"
  }
}
```

`inputPath.rootPath` remains a backend-local/trusted operational contract.
Axis should never become the authority for that path.
