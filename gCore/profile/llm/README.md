# profile LLM Context

This folder contains module-owned LLM context for `profile`.

Human-authored files in this folder should explain module intent, ownership, extension rules, runtime contracts, and project customization guidance. Generated files must stay under `generated/` and are recreated from Nodics source definitions during build.

Recommended use:

1. Read `gSetup/llm/README.md` first for global Nodics rules.
2. Read this module context before changing `profile`.
3. Read `generated/module-context.md`, `generated/schemas.md`, and `generated/tests.md` for current source-derived facts.
4. For project-specific overrides, read the later module layer before changing out-of-the-box Nodics code.

Do not hardcode this module into framework behavior. Use active modules, layered configuration, schemas, runtime governance, and tenant context.

Profile-owned tenant local-file import examples belong under
`data/sample/tenant` using the standard `headers/` and `data/` sample-data
structure. Keep them outside active `data/init` unless the task explicitly
requires runtime bootstrap data. The CSV and XLSX examples must remain
validated by
`gFramework/nData/nImport/import/test/profileTenantLocalFileImportContract.test.js`.
