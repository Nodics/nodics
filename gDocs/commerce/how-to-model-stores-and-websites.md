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

The resolved `downstream` section provides the explicit parameter names used for direct CMS, Product, Pricing, and Inventory requests. Each target module remains responsible for authorization and validation; the browser response never becomes enterprise or tenant authority.

For complete payloads, permissions, lifecycle, security, operations, customization, and tests, use [Storefront Foundation](../../gExp/storefront/docs/storefront-foundation.md).

## Continue

- Store operations: [How To Manage Stores](how-to-manage-stores.md)
- Content: [How To Approve And Publish Content](../content/how-to-approve-and-publish-content.md)
- Architecture: [How Nodics Is Organized](../architecture/how-nodics-is-organized.md)
- Security: [How Users, Tenants, And Permissions Work](../security/how-users-tenants-and-permissions-work.md)
- Documentation home: [Nodics Documentation](../README.md)
