# Tax

Tax is the Commerce authority for jurisdiction rules, provider metadata, tax
rates, exemptions, tax quote headers, and tax quote line evidence.

Pricing may expose customer-facing prices, `taxMode` compatibility hints, and
normalized `taxInclusionMode` declarations, but Tax owns tax calculation
evidence. Cart and Order may later reference accepted tax quote evidence, but
they must not calculate tax, own jurisdiction rules, store provider
credentials, or mutate Tax lifecycle directly.

This first foundation slice provides:

- `taxJurisdiction` for country/region/postal/authority scope and rounding
  policy;
- `taxProvider` for safe provider metadata and adapter names;
- `taxRate` for exact rate records by jurisdiction and tax category;
- `taxExemption` for customer/certificate/category exemption evidence;
- `taxQuote` for calculation header evidence;
- `taxQuoteLine` for line-level taxable amount, tax amount, rate, jurisdiction,
  and exemption evidence;
- `DefaultTaxValidationService` and `DefaultTaxEnterpriseScopeService` for
  enterprise scoping, exact decimal validation, date-range validation,
  lifecycle validation, and hard-delete protection;
- BackOffice metadata for Tax operations under Commerce Operations.

Generated CRUD routers are intentionally disabled. Future checkout calculation,
provider execution, BackOffice mutation, import/export, and reconciliation
flows must use explicit intent APIs, workflow/pipeline services, permissions,
audit, idempotency, and provider-policy contracts.

## Ownership boundaries

Tax owns:

- tax jurisdictions;
- tax categories through references or project extension;
- rates and rounding policy;
- exemptions and certificate references;
- tax quote and quote line evidence;
- tax provider metadata and safe adapter selection;
- tax calculation/reconciliation contracts once introduced.

Tax consumes, but does not own, Pricing evidence:

- `TAX_EXCLUSIVE` means the item price is before tax and Tax may add tax during
  checkout;
- `TAX_INCLUSIVE` means the item price already includes tax and Tax must split
  or audit the tax portion according to jurisdiction policy;
- `taxCountryCode`, `taxJurisdictionCode`, and `taxCategoryCode` tell Tax which
  sales context and tax category Pricing resolved for that item price.

Tax does not own:

- base item prices or price-list assignment resolution — Pricing owns them;
- product category, catalog, unit, or store master data — Product, Catalog,
  Units, and Store own those;
- cart/order lifecycle and accepted checkout evidence — Cart and Order own
  their aggregates;
- payment capture/refund — Payment owns it;
- fulfillment/shipment/carrier execution — Fulfillment owns it;
- provider credentials, certificates, or secrets — secure configuration or a
  customer-owned secret system owns them.

## Exact amounts and rates

Tax uses exact decimal strings for monetary amounts and rates. Examples:

- `taxableAmount: "100.00"`
- `netAmount: "95.24"`
- `grossAmount: "100.00"`
- `taxAmount: "5.00"`
- `rate: "0.05"`

Do not pass JavaScript numbers such as `0.1 + 0.2`. Validation rejects
non-string decimal inputs so tax evidence remains deterministic and auditable.

Inclusive tax is still visible tax. When Pricing resolves a tax-inclusive
customer price, Tax quote lines can store the split as `netAmount`,
`grossAmount`, `taxAmount`, `taxInclusionMode: "TAX_INCLUSIVE"`, and
`taxIncluded: true`. Cart then stores the accepted line evidence and Order
freezes it after placement. This supports common enterprise requirements where
the displayed product price includes tax but invoices, receipts, BackOffice
detail panels, exports, and customer communications must still show the
applied tax amount and rate evidence.

## Provider customization

The default `taxProvider` schema stores safe metadata only:

- `providerCode`;
- `providerType`;
- `displayName`;
- `adapterService`;
- optional `policyService`;
- optional `connectorCode` or `configRef`;
- supported countries, jurisdictions, operations, and notes.

A customer module integrates Avalara, Vertex, TaxJar, a government authority,
ERP, marketplace, or custom tax engine by adding a provider record or layered
configuration and implementing a customer-owned adapter service. The adapter
returns normalized tax quote evidence. It must not persist credentials, raw
provider payloads, private certificates, tokens, or secrets in Tax records.

## BackOffice and Axis

BackOffice contributes Tax navigation under Commerce Operations:

- Tax;
- Tax Jurisdictions;
- Tax Rates;
- Tax Exemptions;
- Tax Providers;
- Tax Quotes;
- Tax Quote Lines.

Axis consumes this metadata as a schema workbench surface. Axis remains a
presentation client and does not calculate tax.

## Verification

```bash
node gComm/baseCommerce/tax/test/taxFoundationContract.test.js
node gComm/test/commerceOperationsBackofficeNavigationContract.test.js
npm run module:metadata
npm run llm:generate
npm run llm:validate
```

## Customize and extend safely

Customer projects should extend Tax by layering schemas, configuration,
provider records, provider adapter services, validation services, and workflow
or pipeline handlers. Do not edit framework Tax source to add a customer tax
provider, jurisdiction exception, exemption rule, or rounding policy.

The smallest provider extension is:

1. add or persist a `taxProvider` record with a safe `adapterService`;
2. implement the adapter in the customer module;
3. layer provider policy in customer configuration;
4. add focused tests for success, rejection, timeout, idempotency, retry,
   provider outage, exemption behavior, and reconciliation evidence.

Rollback disables or retires the customer provider policy without changing
framework schemas or persisted quote evidence.
