# Storefront Contracts

- Exact normalized hostname selects one active endpoint.
- Endpoint selects one tenant-local active Storefront.
- CMS Site and Store data remain owned and validated by their modules.
- Public callers cannot override hostname, tenant, enterprise, or service identity.
- Human management and module authentication remain separate.
- Browser context handles are opaque, short-lived, audience-bound, and stored only through nCache.
- Only authenticated module services may introspect handles; inability to prove active state fails closed.
- Introspection returns one target projection and never delegates the target module's business authority.
