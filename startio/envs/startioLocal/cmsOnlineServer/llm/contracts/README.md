# Online CMS contracts

- Keep `publishEnabled` false and CMS schemas non-versioned.
- Keep the Online database separate from Staged.
- Accept deployment operations only through secured CMS target routes.
- Preserve manifest integrity, idempotent receipts, pointer CAS, tenant scope,
  and rollback to an already imported manifest.
