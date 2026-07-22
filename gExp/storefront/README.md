# Storefront

Storefront is the backend experience boundary that answers: “Which website experience applies to this hostname?” It maps an exact hostname to one tenant-owned Storefront, then composes references owned by CMS and Store. It does not own CMS content, Store records, prices, stock, or a frontend application.

Start with [the beginner and developer guide](docs/storefront-foundation.md). The public resolver is `GET /context/resolve`; protected human management is under `/management/:resource` for `storefronts` and `endpoints`.

The module reuses CMS Site and Store reference contracts. Browser clients never receive internal module tokens, and query or body input cannot override the HTTP hostname.

## Verification

```bash
node gExp/storefront/test/storefrontContract.test.js
node gExp/storefront/test/storefrontProductionHardeningContract.test.js
node gExp/storefront/test/storefrontPersistenceIntegration.test.js
```
