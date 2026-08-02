# BackOffice AI Contracts

- BackOffice owns observed registry/discovery state and presentation enablement.
- Target Nodics modules remain authoritative for operations and authorization.
- Human login and service-to-service registration identities stay separate.
- Frontend registry output contains only approved client-safe metadata.
- Self-registration must be idempotent, environment-bound, auditable, retryable,
  and safe during BackOffice outages.
- Availability retries use registration renewal, a short configured first
  failure interval, and bounded repeated-failure backoff; do not add another
  scheduler or health authority.
- Reuse Nodics loaders and governance paths; never introduce parallel authority.
- Axis reference composition is BackOffice-owned core data imported through
  nData into nCatalog/CMS-owned schemas; it is never a startup write side effect.
- Axis is an employee-only application. Public login and employee recovery
  composition must never include authenticated components, and dashboard
  composition is authenticated by default.
- Module-owned navigation may include bounded `workbenchPresentation` metadata
  for reusable Axis schema workspaces. Treat it as labels, default columns,
  filters, and owner-action hints only; it is not executable authority and must
  not bypass target-module permissions or services.
- Axis reusable component metadata must stay backend-driven and data-only.
  Schema-backed business pages declare `workbenchTarget`, bounded
  `workbenchPresentation`, lifecycle-action hints, reusable detail panels, and
  framework documentation links through the owning module's
  `backofficeCapabilities` contribution. BackOffice validates and filters this
  metadata, but never stores frontend renderers, component names, executable
  render functions, or duplicated page-specific CRUD behavior.
- Framework capability help must link to framework documentation routes. Use
  Axis-only documentation only for concepts that are truly Axis-client specific.

Validation:

```bash
node gExp/backoffice/test/backofficeAxisReusableComponentGovernanceContract.test.js
```
