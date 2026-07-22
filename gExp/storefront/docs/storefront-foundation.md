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

## APIs and identity separation

Human operators use access tokens and `storefront.backoffice.read` or `storefront.backoffice.manage` on `/management/storefronts` and `/management/endpoints`. The service also rejects module service identities, providing defense beyond route configuration.

Customer clients use public `GET /context/resolve`. The resolver uses only the trusted HTTP request hostname. A `hostname` in query or body input is ignored. The result excludes tenant and enterprise internals and returns a client-safe Site, Store, catalog, locale, currency, country, and channel context.

When modules run separately, Storefront uses Nodics internal service authentication. Co-hosted deployments call the same owning services locally. `properties.js` controls module paths, timeout, attempts, and local preference; there is no second registry or direct cross-module database authority.

## Lifecycle, operations, and performance

Both records use `DRAFT`, `ACTIVE`, `SUSPENDED`, and `RETIRED`. Hard deletion is rejected so routing history remains auditable. Effective dates can further bound active records. Publish DNS or gateway changes only after records are active; suspend or retire an endpoint before taking the experience offline.

Resolver caching is currently disabled. This prevents stale routing until Storefront owns a measured revision, key, and invalidation contract. Reuse existing NodeCache, Redis, or Hazelcast capabilities when that contract exists; do not create another cache implementation.

Monitor success and `ERR_STOREFRONT_*` by hostname, correlation ID, module, and status code. Never log access tokens, internal tokens, or full customer headers. Alert on missing active contexts, CMS/Store reference failures, and latency approaching reference timeouts.

Back up bootstrap-tenant endpoints and tenant-local Storefront records. Restore tenant dependencies before enabling endpoint traffic. Deployment health should confirm CMS and Store reference contracts when modules are separate.

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
node gContent/cms/test/cmsSiteReferenceContract.test.js
node gComm/store/test/storeManagementContract.test.js
node gComm/pricing/test/pricingStoreReferenceProviderContract.test.js
```
