# Tax AI and Developer Contracts

Tax is the commerce authority for jurisdiction, rate, exemption, provider, tax
quote, and tax quote line evidence. Read this file with the group-level
[Commerce Checkout Foundation](../../../llm/contracts/commerce-checkout-foundation-contract.md)
before changing checkout tax behavior.

## Authority boundary

- Pricing may resolve `taxInclusionMode`, country, jurisdiction, and category
  context, but Pricing does not calculate tax.
- Tax owns tax quote and quote line evidence, including `netAmount`,
  `grossAmount`, `taxAmount`, `taxInclusionMode`, and `taxIncluded`.
- Cart stores accepted checkout display evidence after Tax/Pricing have
  resolved it.
- Order copies and freezes accepted evidence during placement.
- Axis renders evidence from schema and BackOffice metadata. Axis must not
  calculate tax, infer missing net/gross splits, or create UI-only tax models.

## Inclusive and exclusive tax

`TAX_EXCLUSIVE` means the source price is before tax. Tax may add the tax
amount to produce the customer-facing gross amount.

`TAX_INCLUSIVE` means the source price already includes tax. Tax must still
produce visible split evidence so business users can see what tax was applied.
For example, a displayed `100.00` amount can produce:

```json
{
  "netAmount": "95.24",
  "grossAmount": "100.00",
  "taxAmount": "4.76",
  "taxInclusionMode": "TAX_INCLUSIVE",
  "taxIncluded": true
}
```

All amounts and rates must remain exact decimal strings.

## Configuration and customization

Allowed tax inclusion modes are configuration-backed through
`tax.rate.taxInclusionModes`. Legacy `taxMode` values map through
`tax.rate.legacyTaxModeMap`.

Customer modules may:

- add tax provider records with safe adapter-service names;
- replace provider adapter services;
- layer jurisdiction, rate, exemption, or rounding policy;
- layer BackOffice navigation and `workbenchPresentation` metadata;
- add validation interceptors or workflow/pipeline handlers for governed tax
  quote generation.

Customer modules must not:

- store tax provider credentials or raw provider payloads in Tax records;
- calculate tax inside Cart, Order, Axis, or frontend code;
- bypass Tax quote evidence when storing Cart or Order display evidence;
- fork framework schemas when a layered schema/config/service override is
  enough.

## Axis presentation contract

Tax navigation should expose:

- `taxQuote` default columns for quote identity, provider, jurisdiction,
  subtotal, tax total, inclusion mode, and status;
- `taxQuoteLine` default columns for line identity, quote, entry, category,
  jurisdiction, rate, gross amount, tax amount, and inclusion mode;
- detail sections that separate identity fields from display evidence;
- documentation links to the framework tax/checkout documentation.

Axis can use these hints with reusable schema list/detail renderers. It should
not create custom tax screens that duplicate backend rules.

## Verification

Run:

```bash
node gComm/tax/test/taxFoundationContract.test.js
node gComm/test/commerceOperationsBackofficeNavigationContract.test.js
npm run module:metadata
npm run llm:generate
npm run llm:validate
```
