# Storefront Contracts

- Exact normalized hostname selects one active endpoint.
- Endpoint selects one tenant-local active Storefront.
- CMS Site and Store data remain owned and validated by their modules.
- Public callers cannot override hostname, tenant, enterprise, or service identity.
- Human management and module authentication remain separate.
