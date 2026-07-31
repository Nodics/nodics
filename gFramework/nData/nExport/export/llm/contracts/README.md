# export AI Contracts

This folder contains module-specific AI/developer contracts for `gFramework/nData/nExport/export`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Generated export media boundary

- `nExport` owns source selection, schema-workbench reads, export-policy
  filtering, rendering, and creation of generated export artifacts.
- Generated export files must be stored through `nMedia` as governed media
  records, normally under the `exportFiles` folder and `exportFile` format.
- Axis and other clients download generated exports through the nMedia
  media-code route, for example `GET /nodics/media/v0/download/{mediaCode}`.
- Do not add export-specific binary streaming, `sendFile`, public static-file
  shortcuts, or a second download controller. Delivery remains nMedia plus the
  shared router file-download response handler.
- Export responses may return safe media identity and summary fields, but must
  not expose provider paths, object keys, buckets, signed URL secrets,
  credentials, or backend-resolved full paths.
