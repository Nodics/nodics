# jsImport Module

`jsImport` provides JavaScript-oriented import support for `nData/nImport`. It is the format module for import flows that need executable transformation, custom parsing, or script-backed mapping behavior.

Use this module for JavaScript import adapters and script execution contracts. Keep shared import orchestration, validation flow, diagnostics, run history, and remote transport governance in `nData/nImport/import`.

Executable import behavior must stay governed, testable, and tenant-aware. Project-specific scripts should be registered through definitions and layered configuration rather than embedded in framework code.
