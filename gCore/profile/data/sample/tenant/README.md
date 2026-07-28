# Profile tenant sample import data

This module-owned sample data restores the historical Profile tenant
file-import use case that used `defaultTenantData` CSV and Excel files.

It is intentionally kept under `gCore/profile/data/sample` instead of
`gCore/profile/data/init` because tenant bootstrap data is security-sensitive.
Sample data is imported only when a user or operator intentionally chooses the
sample import process.

The folder follows the standard Nodics data-pack structure:

```text
gCore/profile/data/sample/tenant/
  headers/
    tenantCsvDataHeader.js
    tenantExcelDataHeader.js
    tenantLegacyExcelDataHeader.js
  data/
    defaultTenantCsvData.csv
    defaultTenantExcelData.xlsx
    defaultTenantLegacyExcelData.xls
```

Because CSV, XLSX, and legacy XLS records live in the same `data/` folder, each
header uses a unique `dataFilePrefix`. The file name follows the Nodics data
file convention: it starts with the business capability, includes the file type
where needed, and ends with `Data`.

The CSV and XLSX records are validated end-to-end by
`profileTenantLocalFileImportContract.test.js`. The XLS root preserves the
legacy file reference and should be promoted to an active test only when the
current Excel reader supports legacy binary `.xls` files.

To run the examples intentionally through local import, use this root path:

```text
gCore/profile/data/sample/tenant
```
