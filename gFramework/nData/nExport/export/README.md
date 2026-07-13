# Export Module

`export` is the executable export engine inside `nData/nExport`. It owns shared export orchestration, export access policy checks, dispatch behavior, and the framework contracts that format modules plug into.

Use this module when changing export lifecycle behavior that applies across CSV, Excel, JSON, JavaScript, or future export formats. Format-specific parsing and rendering belongs in the sibling format modules.

Export definitions should remain source-of-truth driven and tenant-aware. Generated export artifacts must be regenerated from definitions rather than edited by hand.
