# How To Model Stores And Website Experiences

## The beginner rule

- A Store answers: “Which commercial or physical operation serves the customer?”
- A CMS Site answers: “Which managed pages and content catalog should the customer see?”
- A Storefront answers: “For this hostname, which CMS Site, Stores, catalogs, countries, languages, currencies, and channels form the customer experience?”

These are separate records because their business owners and lifecycles differ. Storefront references the other records; it does not copy or take ownership of them.

## Common choices

| Requirement | Recommended setup |
| --- | --- |
| Electronics and Apparel have different sites | Two CMS Sites, two Storefronts, and two endpoint hostnames |
| One marketplace uses several Stores | One Storefront with several `storeCodes` and one `defaultStoreCode` |
| One experience has several host aliases | Several endpoint records pointing to one Storefront |
| Country content has a separate lifecycle | A CMS Site and Storefront per independently governed country experience |
| Only visual theme differs | Prefer one CMS Site when content ownership/lifecycle is shared; the separate frontend applies approved presentation |

## Electronics and Apparel example

One enterprise and tenant can configure:

```text
apparel.nodics.com
  -> apparelWeb Storefront
  -> apparelSite CMS Site / apparelContent catalog
  -> apparel Store

electronics.nodics.com
  -> electronicsWeb Storefront
  -> electronicsSite CMS Site / electronicsContent catalog
  -> electronicsDubai and electronicsAbuDhabi Stores
```

Create CMS Sites and Stores first. Then create Storefront records and exact-hostname endpoints. Review in `DRAFT`, activate the Storefront, then activate its endpoint. Customer `GET /context/resolve` calls derive context from the HTTP hostname; browser query/body input cannot select another hostname, tenant, or enterprise.

One Storefront may have several hostname endpoints, but only one non-retired endpoint can be canonical. Additional aliases are non-canonical. Operators retire endpoints before retiring the Storefront so a live customer hostname never targets a retired experience.

For performance, Nodics caches the resolved client-safe context by exact normalized hostname through its existing cache framework. The database remains authoritative: Storefront or endpoint changes invalidate cached contexts, provider failures fall back to live resolution, and deployments can select NodeCache, Redis, or Hazelcast through configuration. Business users do not maintain cache entries manually.

Operations teams can use secured Storefront diagnostics to see resolution success and failure rates, latency, cache behavior, and observed CMS/Store reference health. These diagnostics intentionally hide customer hostnames, tenants, enterprise identity, tokens, URLs, and payloads. Business administrators should report the correlation ID and alert code rather than copying request headers or credentials into support tickets.

During sudden traffic or dependency failure, identical requests share one bounded resolution, unknown hostnames receive a short-lived negative result, excess distinct-host work is rejected safely, and remote CMS/Store communication uses Nodics timeout, retry, and circuit-breaker controls. Operations teams can adjust approved runtime properties through the standard Nodics configuration-governance workflow; no Storefront-specific restart or configuration store is required.

The resolved `downstream` section provides the explicit parameter names used for direct CMS, Product, Pricing, and Inventory requests. Each target module remains responsible for authorization and validation; the browser response never becomes enterprise or tenant authority.

Customer applications may send `x-nodics-client-contract-version` to declare the Storefront contract they understand. Storefront returns its contract version and the request correlation ID in response headers. It also supports ETag-based conditional reads, so an unchanged context returns HTTP 304 without retransmitting the payload. An obsolete client receives HTTP 426 and must be upgraded; an overloaded or rate-limited call supplies `Retry-After`. These are delivery safeguards, not new ownership paths: the response still contains routing hints only, while each target module validates trusted identity and business scope itself.

For complete payloads, permissions, lifecycle, security, operations, customization, and tests, use [Storefront Foundation](../../gExp/storefront/docs/storefront-foundation.md).

## Continue

- Store operations: [How To Manage Stores](how-to-manage-stores.md)
- Content: [How To Approve And Publish Content](../content/how-to-approve-and-publish-content.md)
- Architecture: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Documentation home: [Nodics Documentation](../README.md)
