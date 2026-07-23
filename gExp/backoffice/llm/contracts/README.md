# BackOffice AI Contracts

- BackOffice owns observed registry/discovery state and presentation enablement.
- Target Nodics modules remain authoritative for operations and authorization.
- Human login and service-to-service registration identities stay separate.
- Frontend registry output contains only approved client-safe metadata.
- Self-registration must be idempotent, environment-bound, auditable, retryable,
  and safe during BackOffice outages.
- Reuse Nodics loaders and governance paths; never introduce parallel authority.
- Axis reference composition is BackOffice-owned core data imported through
  nData into nCatalog/CMS-owned schemas; it is never a startup write side effect.
- Axis is an employee-only application. Public login and employee recovery
  composition must never include authenticated components, and dashboard
  composition is authenticated by default.
