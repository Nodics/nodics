# How to configure and operate Pricing

## Who this guide is for

This guide is for pricing managers, merchandisers, approvers, operations teams, and developers. It does not assume knowledge of Nodics internals.

## Business setup example

An enterprise sells a phone across the UAE. The normal enterprise price is AED 5,000. A Dubai store price is AED 4,900. VIP customers buying at least five units pay AED 4,700.

1. Create an enterprise Price List containing the normal price.
2. Assign it to the Enterprise scope.
3. Create a Dubai Price List and assign it to Store `dubai`.
4. Create a `CUSTOMER_SEGMENT` Price Group and add the authoritative VIP segment reference.
5. Add the quantity-five VIP Price to the Dubai list.
6. Check currency, Unit, net/gross declaration, start/end dates, and priorities.
7. Submit the Price List publication through the configured Workflow.
8. Complete each Workflow action as manual or automatic according to its action configuration.
9. After approval, let nPublish deploy the immutable release to Online.
10. Verify an ordinary quantity-one request returns AED 4,900 and a VIP quantity-five request returns AED 4,700.

Do not edit Online prices directly. Do not use a promotion to repair a wrong base price. Correct Staged configuration and publish a new approved version.

## Using Pricing from BackOffice

The BackOffice application obtains the active Pricing endpoint from the BackOffice registry, then calls Pricing directly. The registry does not store Prices or proxy commercial operations.

1. Sign in with the human login flow and open **Pricing**. A module or cron service token cannot manage prices.
2. Create a Price List in `DRAFT`, selecting currencies, priority, net/gross mode, and effective dates.
3. Add assignments. Start with the broadest correct scope and add narrower scopes only for a real commercial rule.
4. Create optional Item, Customer, Customer Segment, or Contract Price Groups and memberships.
5. Create exact Price records. Enter amount and quantity as decimal text such as `4900.00` and `5`; scientific notation is invalid.
6. Select **Validate** and correct invalid references, dates, currency, Unit, priority, or qualifier combinations.
7. Select **Check conflicts**. If overlaps are returned, retire or narrow the obsolete record instead of relying on record order.
8. Select **Simulate** with representative store, site, channel, customer, and quantity contexts. Simulation does not save or cache anything.
9. Activate the Staged records and submit the Price List to Workflow. Each Workflow action may be manual or automatic.
10. After approval and nPublish deployment, verify equivalent Online resolution through the normal application integration.

`pricing.backoffice.read` permits browsing, `pricing.backoffice.preview` permits validation/conflict/simulation, and `pricing.backoffice.manage` permits create/update/retire. Grant them only to suitable human roles. Hard deletion is unavailable so history is preserved.

## Serving a website price

Suppose Apparel and Electronics are two websites for the same enterprise and tenant. Storefront resolves each hostname to a different Site, Store, currency, and channel. The application sends the returned opaque handle to Pricing:

```http
POST /nodics/pricing/v0/delivery/storefront/prices/resolve HTTP/1.1
Content-Type: application/json
x-nodics-storefront-context: <opaque handle from Storefront>

{
  "item": { "itemType": "SKU", "itemCode": "IPHONE-17-PRO" },
  "quantity": "1",
  "unitCode": "piece"
}
```

Pricing asks Storefront whether the handle is active for Pricing, derives the website's tenant, enterprise, Site, Store, currency, and channel, and evaluates the currently published Online Prices. The browser cannot choose another website's scope by adding `currencyCode`, `context`, tenant, enterprise, or customer fields. If the handle expires or Storefront cannot prove it active, refresh the hostname context and retry; do not weaken the failure policy.

This is a delivery API, not a BackOffice API. The existing `/references/prices/resolve` route remains for authenticated module-to-module calls, while people continue using the human management permissions described above.

### Submitting a release

Choose a stable submission reference, the Price List, its exact Staged version, and the changed versioned items. Select `MANUAL` when a person must approve the commercial change, or `AUTOMATIC` only when the organization's configured policy permits automated approval. Retrying the same submission reference returns the existing carrier rather than creating a duplicate release.

For manual processing, the assigned workflow user reviews the scope, amount, currency, Unit, dates, quantity tiers, conflict preview, simulation evidence, and associated items. `SUCCESS` continues to nPublish; `REJECT` ends the approval path without changing Online. In automatic mode the head moves directly to the same nPublish action. Neither mode copies records directly to Online.

Expected successful result: Workflow records the decision, nPublish validates and freezes the requested Staged version, the named Online connection imports the integrity-checked manifest, the Pricing Online pointer changes atomically, and the Online price cache is invalidated.

## Choosing scopes

- Use **Enterprise** for the broad default.
- Use **Country** for national commercial differences.
- Use **Site** for a specific website or application experience.
- Use **Store** for a physical or digital Store agreement.
- Use **Channel** only when the base price genuinely differs by channel.
- Use **Customer Segment** for shared eligibility such as VIP or wholesale.
- Use **Customer** for negotiated customer-specific base prices.

Prefer the broadest correct scope. Excessive customer-specific Prices increase maintenance and ambiguity risk.

## Price Lists versus Price Groups

A Price List controls which commercial collection is eligible in a context. A Price Group lets several items or customers share one Price definition. Assigning a Price List to Dubai does not make Dubai a Price Group; adding a customer to VIP does not copy that customer into Pricing.

## Approval, rejection, and recovery

An approver should confirm affected scopes, item/customer eligibility, currencies, Units, quantity tiers, effective dates, net/gross declaration, overlap warnings, and a sample comparison with the current Online result.

- If rejected, correct the Staged version and resubmit.
- If deployment times out, check target health and retry the same publication; deployment is idempotent.
- Keep the existing `units` capability active wherever Pricing validates or serves prices, and configure the Online runtime's named `nems` connection so cache invalidations propagate through the existing event authority.
- If a release is commercially wrong, use nPublish rollback and then create a corrected Staged version.
- If the resolver reports ambiguity, remove or reprioritize overlapping configurations. The system deliberately refuses to guess.

## Developer and operator checklist

- Set Pricing `runtimeRole` to `STAGED` only on the versioned authoring runtime and `ONLINE` only on the non-versioned delivery runtime.
- Configure a named non-default Online module connection and internal service authentication.
- Keep `currencyConversion.enabled` false unless an approved exchange-rate provider exists.
- Configure Store, customer, segment, item, and Unit reference providers as those authorities become available.
- Grant human access only to the narrow Pricing management permissions. Internal resolution/publication routes continue to use service tokens.
- Configure `pricing.storefrontContext` only through layered `properties.js`. Keep introspection retries low, responses bounded, and shared Storefront security-state cache available in multi-node deployments.

## Runtime verification

Run `npm run test:topology:modular` to exercise the implemented Staged-to-Online Pricing lifecycle with separate databases. The suite verifies manual and automatic actions, rejection without Online change, replay, cache refresh, restart recovery, rollback, target outage failure, recovery, and rejection of unauthenticated target calls.
- Configure `pricing.management.maximumResultCount`, `maximumPreviewRecords`, and `maximumPayloadBytes` for deployment scale; do not remove the bounds.
- Monitor no-price, ambiguity, target-unavailable, integrity, pointer-conflict, cache, latency, and candidate-count signals.
- Back up Staged pricing data plus Online manifests, pointers, and receipts; test restoration and rollback.
- Keep Staged and Online database names distinct. The local reference topology co-hosts CMS and Pricing in publishing processes, but uses direct module APIs and separate named target connections; production may deploy Pricing independently through later environment configuration.

Implementation details and extension rules are in the Pricing module's [architecture guide](../../gComm/pricing/docs/pricing-architecture-and-operations.md).

## Continue

- [How Store Management Works](how-to-manage-stores.md)
- [How Stock Availability Works](how-stock-availability-works.md)
- [How To Approve And Publish Content](../content/how-to-approve-and-publish-content.md)
