# Pricing

Pricing is Nodics' enterprise-scoped authority for reusable Price Lists, contextual assignments, typed Price Groups, exact Price records, and deterministic price resolution.

A Price List can be assigned to an enterprise, country, site, store, channel, customer segment, or customer without copying its Price records. A Price can target one item or Item Price Group, optionally specialize for a customer or Customer Price Group, define an exact currency amount, unit, unit factor, quantity tier, sales-tax declaration, channel, and validity window.

Pricing does not own Stores, customers, products/items, Units, tax calculation, promotions, exchange rates, workflow, publishing, or cache providers. It composes those authorities through stable references and configured providers. `STORE` assignments now use the Store-owned reference provider locally when co-hosted or through Store's service-token reference intent when separately deployed.

Pricing does own the pricing-side tax declaration because that is part of the
customer-facing price evidence. A price list or individual price may declare:

- `taxInclusionMode: "TAX_EXCLUSIVE"` when tax will be added later;
- `taxInclusionMode: "TAX_INCLUSIVE"` when the displayed item price already
  includes tax;
- optional `taxCountryCode`, `taxJurisdictionCode`, and tax category fields so
  the same product can have different price evidence in different sales
  countries or jurisdictions.

The legacy `taxMode` values remain supported for compatibility: `NET` maps to
`TAX_EXCLUSIVE`, and `GROSS` maps to `TAX_INCLUSIVE`. Price resolution returns
both fields plus the resolved tax country, jurisdiction, and category. Tax then
uses that evidence to quote or audit tax; Pricing still does not calculate tax
amounts.

Pricing also owns customer-facing delivery charge quote evidence. A
`deliveryChargeQuote` captures the enterprise, delivery mode, optional carrier,
optional cart/delivery group context, exact amount, currency, tax mode,
calculation strategy, source reference, idempotency key, lifecycle state, and
optional expiry. Cart and Order may copy the accepted quote reference and
amount into delivery groups, but they do not calculate the charge. Fulfillment
later owns operational carrier/shipment evidence and may reconcile actual
carrier cost separately; it must not rewrite the accepted customer-facing
delivery charge stored on the order.

Business changes are created in a versioned Staged runtime and released through Workflow and `nPublish` to a separate non-versioned Online runtime. A separate BackOffice client discovers Pricing through the BackOffice module registry and calls Pricing's human-only management and preview intent APIs directly. Modules use the service-token-only `POST /references/prices/resolve` intent. Customer applications use `POST /delivery/storefront/prices/resolve` with an opaque Storefront context handle; Pricing derives tenant, enterprise, Site, Store, currency, and channel from protected introspection before invoking the same resolver and cache. Generated persistence routers are disabled.

The management API submits a Price List release through `POST /management/publications/submit`. `pricing.workflow.defaultMode` selects the OOTB manual-review or automatic-approval path; both paths converge on `DefaultPublicationLifecycleService.publishApproved` and therefore preserve nPublish validation, deployment, retry, audit, and rollback authority.

The modular runtime acceptance suite proves this contract against distinct Staged and Online databases. It covers manual approval, manual rejection, automatic approval, idempotent replay, target authentication, cache invalidation, Online restart recovery, rollback, failed-closed target outage, and recovery publication. Pricing composes the existing Units, Workflow, nPublish, cache, and NEMS authorities; it does not replace them.

Read Pricing Architecture and Operations (canonical documentation: `capability.commerce.technical-reference`) and the [business guide](https://github.com/Nodics/nodicsdocs).

## Verification

```bash
node gComm/pricing/test/pricingFoundationContract.test.js
node gComm/pricing/test/priceResolutionContract.test.js
node gComm/pricing/test/pricingPublicationContract.test.js
node gComm/pricing/test/pricingManagementContract.test.js
node gComm/pricing/test/pricingPublicationWorkflowContract.test.js
node startio/envs/startioLocal/cmsOnlineServer/test/publicationTopologyContract.test.js
npm run test:topology:modular
```
