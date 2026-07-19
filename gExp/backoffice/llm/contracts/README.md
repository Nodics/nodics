# BackOffice AI Contracts

- BackOffice owns observed registry/discovery state and presentation enablement.
- Target Nodics modules remain authoritative for operations and authorization.
- Human login and service-to-service registration identities stay separate.
- Frontend registry output contains only approved client-safe metadata.
- Self-registration must be idempotent, environment-bound, auditable, retryable,
  and safe during BackOffice outages.
- Reuse Nodics loaders and governance paths; never introduce parallel authority.
