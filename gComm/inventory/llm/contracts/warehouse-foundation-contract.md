# Warehouse Foundation AI Contract

- Require authenticated tenant and enterprise ownership scope.
- Derive internal `code`; accept business `warehouseCode` and `locationCode`.
- Scope generated get, update, and remove queries at persistence interceptors.
- Keep warehouse/location identity and location parentage immutable.
- Reject missing, cross-warehouse, retired, cyclic, or over-depth parents.
- Retire children before parents and locations before warehouses.
- Never hard-delete warehouse foundation records.
- Keep generated routers disabled until intent APIs, permissions, exposure, and
  negative security tests exist.
- Extend classifications, transitions, and depth through layered properties.
- Do not create store, product, Unit, stock, sourcing, scheduling,
  event, or external-provider authorities in this foundation.
- Run focused tests and regenerate context after source/document changes.
