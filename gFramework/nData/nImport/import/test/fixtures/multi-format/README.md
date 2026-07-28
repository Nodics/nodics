# Multi-format import fixtures

These files are committed examples for the Nodics import file processors.

They are test fixtures only. They must not be treated as active module `init`,
`core`, or `sample` data, and they must not create runtime tenants, enterprises,
catalogs, or other business records during normal server startup.

The fixture set intentionally covers the supported built-in import formats:

- `records.js`
- `records.json`
- `records.csv`
- `records.xlsx`
- `empty-records.json`
- `invalid-records.json`
- `empty-records.csv`
- `records-after-empty.json`
- `records-after-empty.csv`

Use these files when validating import processor behavior or when explaining how
projects can provide governed external file import examples through the
existing `nImport` lifecycle.
