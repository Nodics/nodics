# CMS Site Reference Contract

CMS is the sole authority for `cmsSite`, its catalog reference, and the content reachable through that Site. Other modules must not copy the Site schema or infer its existence from duplicated configuration.

The implemented `POST /references/sites/resolve` route accepts a Nodics service token only. It validates one bounded `cmsSiteCode`, reads the active Site in the current tenant, and returns only `cmsSiteCode`, `name`, and `catalogCode`. A missing Site returns `found: false`; an access token or invalid code fails closed.

Store uses this route only when CMS runs in another modular process. When co-hosted, Store calls `DefaultCmsSiteService` locally with the same tenant and active-Site rule. `store.cmsSiteReference` selects the module name, API path, timeout, retries, and local preference. Runtime endpoints continue to come from `servers`; secrets never belong in module properties.

This contract validates a reference. It does not transfer CMS authority, grant content access, select a frontend renderer, or establish enterprise ownership. Store's enterprise-scoped binding owns the commerce association; CMS continues to own Site/catalog/content.

Verify with:

```bash
node gContent/cms/test/cmsSiteReferenceContract.test.js
node gComm/store/test/storeContentSiteBindingContract.test.js
```
