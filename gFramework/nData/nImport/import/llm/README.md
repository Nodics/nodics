# import LLM Context

This folder contains module-owned LLM context for `import`.

Human-authored files in this folder should explain module intent, ownership, extension rules, runtime contracts, and project customization guidance. Generated files must stay under `generated/` and are recreated from Nodics source definitions during build.

Recommended use:

1. Read `gSetup/llm/README.md` first for global Nodics rules.
2. Read this module context before changing `import`.
3. Read `generated/module-context.md`, `generated/schemas.md`, and `generated/tests.md` for current source-derived facts.
4. For project-specific overrides, read the later module layer before changing out-of-the-box Nodics code.

Do not hardcode this module into framework behavior. Use active modules, layered configuration, schemas, runtime governance, and tenant context.

Committed multi-format examples belong under
`test/fixtures/multi-format`. Keep them as test/demo evidence for JavaScript,
JSON, CSV, and Excel import processors. Do not move them into active
`data/init`, `data/core`, or `data/sample` folders unless a specific module
owns that runtime seed data and the import contract, documentation, and tests
are updated for that module-owned behavior.

The restored historical Profile tenant file-import use case belongs under
`gCore/profile/data/sample/tenant`, with the normal `headers/` and `data/`
sample-data structure. Preserve Profile ownership for these tenant records.
Keep the CSV and XLSX paths covered by
`profileTenantLocalFileImportContract.test.js`.
