# Storefront Contracts

- Exact normalized hostname selects one active endpoint.
- Endpoint selects one tenant-local active Storefront.
- CMS Site and Store data remain owned and validated by their modules.
- Public callers cannot override hostname, tenant, enterprise, or service identity.
- Human management and module authentication remain separate.
- Browser context handles are opaque, short-lived, audience-bound, and stored only through nCache.
- Only authenticated module services may introspect handles; inability to prove active state fails closed.
- Introspection returns one target projection and never delegates the target module's business authority.
- Rotation atomically consumes the predecessor; explicit revocation uses governed exact-key nCache invalidation.
- Optional binding is configuration-driven, stores only a digest, and must be forwarded to Storefront by delivery modules.
- Never add a parallel token database, revocation registry, local limiter, or human-auth coupling.
- Storefront suspension and retirement replace the scoped revocation generation before persistence; failures must block the lifecycle change.
- Manual Storefront-wide revocation requires a human access token and `storefront.operations.manage`; exact-handle revocation remains service-only.
- Context audit projection must reject handles, bindings, hashes, generations, credentials, cookies, payload context, and free-form secrets.
- Audit or NEMS delivery failure must degrade diagnostics without reversing successful revocation; use existing publishers and never add a Storefront retry queue.
- Successful issuance may use bounded property-driven audit sampling; rejection, revocation, lifecycle, and failure evidence must never be sampled.
- Optimize generation lookup only from representative measurements and never with process-local state that can accept revoked handles.
