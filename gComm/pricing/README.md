# Pricing

Pricing is Nodics' enterprise-scoped authority for reusable Price Lists, contextual assignments, typed Price Groups, exact Price records, and deterministic price resolution.

A Price List can be assigned to an enterprise, country, site, store, channel, customer segment, or customer without copying its Price records. A Price can target one item or Item Price Group, optionally specialize for a customer or Customer Price Group, define an exact currency amount, unit, unit factor, quantity tier, tax declaration, channel, and validity window.

Pricing does not own Stores, customers, products/items, Units, tax calculation, promotions, exchange rates, workflow, publishing, or cache providers. It composes those authorities through stable references and configured providers. `STORE` assignments now use the Store-owned reference provider locally when co-hosted or through Store's service-token reference intent when separately deployed.

Business changes are created in a versioned Staged runtime and released through Workflow and `nPublish` to a separate non-versioned Online runtime. A separate BackOffice client discovers Pricing through the BackOffice module registry and calls Pricing's human-only management and preview intent APIs directly. Online callers use the service-token-only `POST /references/prices/resolve` intent API. Generated persistence routers are disabled.

The management API submits a Price List release through `POST /management/publications/submit`. `pricing.workflow.defaultMode` selects the OOTB manual-review or automatic-approval path; both paths converge on `DefaultPublicationLifecycleService.publishApproved` and therefore preserve nPublish validation, deployment, retry, audit, and rollback authority.

The modular runtime acceptance suite proves this contract against distinct Staged and Online databases. It covers manual approval, manual rejection, automatic approval, idempotent replay, target authentication, cache invalidation, Online restart recovery, rollback, failed-closed target outage, and recovery publication. Pricing composes the existing Units, Workflow, nPublish, cache, and NEMS authorities; it does not replace them.

Read [Pricing Architecture and Operations](docs/pricing-architecture-and-operations.md) and the [business guide](../../gDocs/commerce/how-to-configure-and-operate-pricing.md).

## Verification

```bash
node gComm/pricing/test/pricingFoundationContract.test.js
node gComm/pricing/test/priceResolutionContract.test.js
node gComm/pricing/test/pricingPublicationContract.test.js
node gComm/pricing/test/pricingManagementContract.test.js
node gComm/pricing/test/pricingPublicationWorkflowContract.test.js
node startio/envs/startioLocal/startioLocalCmsOnlineServer/test/publicationTopologyContract.test.js
npm run test:topology:modular
```
