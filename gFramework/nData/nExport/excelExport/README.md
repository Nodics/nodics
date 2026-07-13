# excelExport Module

`excelExport` provides spreadsheet-oriented export support for the `nData/nExport` family. It owns Excel-specific output conventions, workbook/sheet mapping behavior, and adapter wiring used by the shared export engine.

Use this module for spreadsheet format behavior only. Shared export lifecycle, access policy, and orchestration remain owned by `nData/nExport/export`.

Project-specific workbook layouts should be supplied through definitions and layered configuration rather than hardcoded in framework code.
