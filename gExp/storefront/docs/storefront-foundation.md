# Storefront Foundation

## What problem does this solve?

An enterprise may operate `apparel.nodics.com` and `electronics.nodics.com` in the same tenant. Each hostname can select a different CMS Site, content catalog, Store, product catalog, language, currency, country, and channel. Storefront holds that customer-experience composition without copying records owned by other modules.

Configure it in this order:

1. CMS creates the Site and owns its content catalog relationship.
2. Store creates commercial or physical Store records.
3. nCatalog owns catalogs; Storefront validates product catalog codes through that existing authority.
4. Storefront creates a `storefront` record referencing one CMS Site and one or more Stores.
5. Storefront creates `storefrontEndpoint` records mapping exact hostnames to that Storefront.
6. After review, operators activate both records. A customer request can then resolve the context.

## The two records

`storefront` is tenant-local and enterprise-owned. Its stable identity is `storefrontCode`. Every default Store, product catalog, locale, currency, or channel must belong to its corresponding list. CMS Site and Store references are checked through their owning modules before persistence.

`storefrontEndpoint` is stored in the configured bootstrap tenant, `default` by default. Nodics needs this small global lookup because the hostname discovers the target tenant. It maps one normalized exact DNS hostname to `tenantCode`, `enterpriseCode`, and `storefrontCode`. Wildcards, URL strings, ports, IP addresses, user information, and single-label hosts are rejected.

Several endpoint records may point to the same Storefront. One Storefront can reference several Stores, so one CMS Site may intentionally serve those Stores without duplicating CMS ownership.

## Beginner example

Create the tenant-local Storefront through protected management:

```json
{
  "storefrontCode": "electronicsWeb",
  "name": "Electronics UAE",
  "cmsSiteCode": "electronicsSite",
  "storeCodes": ["electronicsDubai", "electronicsAbuDhabi"],
  "defaultStoreCode": "electronicsDubai",
  "productCatalogCodes": ["electronicsProduct"],
  "defaultProductCatalogCode": "electronicsProduct",
  "countryCodes": ["AE"],
  "defaultCountryCode": "AE",
  "localeCodes": ["en-AE", "ar-AE"],
  "defaultLocaleCode": "en-AE",
  "currencyCodes": ["AED"],
  "defaultCurrencyCode": "AED",
  "channelCodes": ["WEB"],
  "defaultChannelCode": "WEB",
  "status": "DRAFT"
}
```

Then create its endpoint:

```json
{
  "hostname": "electronics.nodics.com",
  "storefrontCode": "electronicsWeb",
  "canonical": true,
  "scheme": "https",
  "status": "DRAFT"
}
```

The authenticated request supplies enterprise and tenant ownership. Clients must not supply or trust `enterpriseCode`; Nodics derives it from the human access token. Activate the Storefront first, then its endpoint.

Only one non-retired endpoint may be canonical for a Storefront. Alias endpoints set `canonical` to `false`. An endpoint cannot become `ACTIVE` until its target Storefront is active. Retire every endpoint before retiring the Storefront. Invalid schemes, statuses, lifecycle transitions, and effective dates fail before persistence.

New and updated endpoints receive a derived `canonicalKey` protected by a sparse unique index. The sparse index permits an in-place upgrade from the first Storefront release; update legacy endpoint records once during deployment to backfill the key before relying on database-level race protection.

## APIs and identity separation

Human operators use access tokens and `storefront.backoffice.read` or `storefront.backoffice.manage` on `/management/storefronts` and `/management/endpoints`. The service also rejects module service identities, providing defense beyond route configuration.

Customer clients use public `GET /context/resolve`. The resolver uses only the trusted HTTP request hostname. A `hostname` in query or body input is ignored. The result excludes tenant and enterprise internals and returns a client-safe Site, Store, catalog, locale, currency, country, and channel context.

The response also provides a `downstream` convenience projection. It maps the same resolved values to the parameter names currently consumed by CMS, Product, Pricing, and Inventory. These values are routing hints, not delegated authority: every target module continues deriving tenant and enterprise through its own trusted request pipeline and validating its own business rules.

```json
{
  "downstream": {
    "cms": { "site": "electronicsSite", "locale": "en-AE", "channel": "WEB" },
    "product": { "catalogCode": "electronicsProduct", "locale": "en-AE" },
    "pricing": { "siteCode": "electronicsSite", "storeCode": "electronicsDubai", "currencyCode": "AED", "channelCode": "WEB" },
    "inventory": { "storeCode": "electronicsDubai", "countryCode": "AE", "channelCode": "WEB" }
  }
}
```

When modules run separately, Storefront uses Nodics internal service authentication. Co-hosted deployments call the same owning services locally. `properties.js` controls module paths, timeout, attempts, and local preference; there is no second registry or direct cross-module database authority.

## Lifecycle, operations, and performance

Both records use `DRAFT`, `ACTIVE`, `SUSPENDED`, and `RETIRED`. Hard deletion is rejected so routing history remains auditable. Effective dates can further bound active records. Publish DNS or gateway changes only after records are active; suspend or retire an endpoint before taking the experience offline.

Resolver caching is currently disabled. This prevents stale routing until Storefront owns a measured revision, key, and invalidation contract. Reuse existing NodeCache, Redis, or Hazelcast capabilities when that contract exists; do not create another cache implementation.

Monitor success and `ERR_STOREFRONT_*` by hostname, correlation ID, module, and status code. Never log access tokens, internal tokens, or full customer headers. Alert on missing active contexts, CMS/Store reference failures, and latency approaching reference timeouts.

Back up bootstrap-tenant endpoints and tenant-local Storefront records. Restore tenant dependencies before enabling endpoint traffic. Deployment health should confirm CMS and Store reference contracts when modules are separate.

## Production activation checklist

1. Create and activate the CMS Site, Stores, and nCatalog catalogs in the target tenant.
2. Create the Storefront in `DRAFT`; verify every default belongs to its configured list.
3. Create one canonical endpoint in `DRAFT`, plus optional non-canonical aliases.
4. Activate the Storefront, then activate its endpoints.
5. Configure DNS and TLS at the edge. Preserve the original `Host` header. Do not trust `X-Forwarded-Host` unless a later deployment module explicitly replaces the resolver behind a trusted-proxy policy.
6. Call `GET /context/resolve` through the real gateway hostname and confirm the resolved values.
7. Exercise direct CMS, Product, Pricing, and Inventory calls with `downstream`; confirm every target module rejects foreign or invalid context.
8. Test a dependency outage. Resolution must fail closed; after recovery, the next request must resolve without registry edits or process restart.
9. Monitor `ERR_STOREFRONT_00005`, `ERR_STOREFRONT_00009`, and `ERR_STOREFRONT_00010` by correlation ID and hostname.
10. For shutdown, retire aliases and the canonical endpoint before retiring the Storefront.

## Repeatable Electronics and Apparel setup

Use the existing Nodics import authority or the protected management APIs; do not add a Storefront-specific loader.

| Hostname | Storefront | CMS Site | Default Store | Product catalog |
| --- | --- | --- | --- | --- |
| `electronics.nodics.com` | `electronicsWeb` | `electronicsSite` | `electronicsDubai` | `electronicsProduct` |
| `apparel.nodics.com` | `apparelWeb` | `apparelSite` | `apparelDubai` | `apparelProduct` |

Create or import tenant-local Storefront records first. Create hostname endpoints in the configured bootstrap tenant only after their target Storefronts exist. Keep both record types in `DRAFT` during review; activation remains a governed operation rather than an import side effect.

## Extension rules

- Reuse an owning module reference API before adding a lookup.
- Store only customer-experience choices here; do not copy mutable CMS, Store, Product, Pricing, or Inventory data.
- Put application policy in layered `properties.js`, not `package.json`.
- Keep `defaultSampleService.js` as the untouched generator placeholder.
- Add positive, negative, boundary, contract, integration, and regression tests for each new dimension.
- Document implemented behavior here; keep future action plans in ignored root `docs/`.

## Verification

```bash
node gExp/storefront/test/storefrontContract.test.js
node gExp/storefront/test/storefrontProductionHardeningContract.test.js
node gExp/storefront/test/storefrontPersistenceIntegration.test.js
node gContent/cms/test/cmsSiteReferenceContract.test.js
node gComm/store/test/storeManagementContract.test.js
node gComm/pricing/test/pricingStoreReferenceProviderContract.test.js
```
