# Pricing architecture and operations

## Purpose and terminology

Pricing answers one bounded question: **which base price applies to this item, quantity, unit, currency, customer, and selling context at this time?**

- A **Price List** is a reusable commercial collection, such as UAE Retail or Wholesale Contract prices.
- A **Price List Assignment** makes a list eligible for an enterprise, country, site, store, channel, customer segment, or customer.
- A **Price Group** groups item or customer references without copying their authoritative records.
- A **Price** is one exact amount qualified by list, item or Item Group, optional customer or Customer Group, currency, unit, quantity tier, channel, and validity.
- **Staged** is the versioned business-editing runtime. **Online** is the separate non-versioned runtime serving application traffic.

Pricing does not calculate tax, evaluate promotions, convert currency by default, own products/customers/stores/units, or publish through a private mechanism.

## Ownership and integration

Pricing owns `priceList`, `priceListAssignment`, `priceGroup`, `priceGroupMember`, and `price`. Store supplies Store identity, Profile supplies enterprise/customer identity, Product supplies item identity, and Units supplies Unit definitions and conversions. Configured reference providers validate those references without copying master data. The implemented Store provider uses the local generated Store service when co-hosted or Store's service-token-only `/references/stores/resolve` intent when modular.

Workflow governs manual and automatic approval actions. `nPublish` owns publication state, audit, activation, rollback, and provider selection. `DefaultCacheService` owns provider-neutral cache access. Human BackOffice login remains separate from service tokens used by resolution and Staged-to-Online transport. BackOffice discovers `pricing-management` from self-registered module metadata, but Pricing remains the API and data authority.

## Human management and safe preview APIs

Generated CRUD routers remain disabled. A separately deployed BackOffice client uses explicit Pricing intents:

| Intent | Method and path | Permission | Result |
| --- | --- | --- | --- |
| Browse | `GET /management/:resource` | `pricing.backoffice.read` | Bounded safe projection using scalar allow-listed filters |
| Read | `GET /management/:resource/:businessCode` | `pricing.backoffice.read` | One enterprise-owned record |
| Create | `POST /management/:resource` | `pricing.backoffice.manage` | Save through generated service and interceptors |
| Update | `PATCH /management/:resource/:businessCode` | `pricing.backoffice.manage` | Validated update by immutable business identity |
| Retire | `POST /management/:resource/:businessCode/retire` | `pricing.backoffice.manage` | Lifecycle transition without hard deletion |
| Validate | `POST /management/preview/validate` | `pricing.backoffice.preview` | Non-persistent validation and normalization |
| Conflicts | `POST /management/preview/conflicts` | `pricing.backoffice.preview` | Exact qualifier and date-overlap detection |
| Simulate | `POST /management/preview/simulate` | `pricing.backoffice.preview` | Non-cached, non-persistent deterministic resolution |
| Submit | `POST /management/publications/submit` | `pricing.backoffice.manage` | Creates and releases an idempotently identified Workflow carrier |

Resources are `priceLists`, `assignments`, `groups`, `memberships`, and `prices`. Routes accept human access tokens only, and the management service independently rejects service identities. Enterprise ownership comes from authenticated claims; client `enterpriseCode` and internal `code` are discarded. Result counts, preview candidates, and payload bytes are bounded by `pricing.management` properties.

Conflict preview finds equal Price qualifiers within the same list, currency, Unit, quantity tier, channel, and overlapping dates. Simulation remains the final safety check because assignments and group memberships can create ambiguity across different records.

## Deterministic resolution

The request supplies item, exact quantity, unit, currency, and optional country/site/store/channel/customer/group context. The resolver:

1. Derives enterprise ownership from authenticated claims.
2. Rejects unknown context keys and oversized arrays.
3. Loads active, effective assignments matching the context.
4. Removes explicitly excluded Price Lists.
5. Loads active, effective Price Lists and Pricing-owned group memberships.
6. Requires exact currency and Unit matches.
7. Rejects inactive, expired, future, wrong-channel, wrong-item, wrong-customer, and unmet quantity-tier candidates.
8. Orders candidates by configured scope specificity, customer specificity, item specificity, greatest eligible quantity tier, assignment priority, then Price List priority.
9. Fails with `ERR_PRICE_00035` when two candidates still have the same business rank.

The default scope order is Customer, Customer Segment, Store, Channel, Site, Country, Enterprise. Projects may change the numeric specificity in layered `properties.js` and test the resulting contract.

### Direct Storefront price delivery

An anonymous customer application first resolves its hostname through Storefront and receives a short-lived opaque handle. It then calls `POST /delivery/storefront/prices/resolve` with that handle in `x-nodics-storefront-context` and supplies only the item, exact decimal-string quantity, Unit, and optional evaluation time. Pricing introspects the handle for the `pricing` audience using a module service identity. The trusted projection supplies tenant, enterprise, Site, Store, currency, and channel.

Caller-supplied `currencyCode`, `context`, tenant, enterprise, customer, segment, or contract qualifiers are not carried into resolution. This prevents the Electronics website from selecting an Apparel Price List and prevents an anonymous caller from claiming customer eligibility. Pricing then invokes the same `DefaultPriceResolutionFacade`, deterministic resolver, published Online records, and provider-neutral cache used by internal callers. Missing, expired, wrong-audience, incomplete, or unavailable context fails with `ERR_PRICE_00065`; it never falls back to browser scope.

The existing `POST /references/prices/resolve` route remains service-token-only for trusted modules that already possess an authenticated enterprise and approved resolution context. Human BackOffice management remains separate from both delivery paths.

## Exact values

`amount`, `minimumQuantity`, and request `quantity` are decimal strings. Scientific notation, negative values, excessive digits, and excessive scale are rejected. `unitFactor` is a bounded positive integer. Runtime comparisons align decimal scales with `BigInt`; JavaScript floating point is not used.

Currency conversion is disabled by default. A missing exact-currency price fails clearly. A future configured exchange-rate provider may add conversion without moving exchange-rate authority into Pricing.

## Staged approval and Online activation

All five business schemas are non-versioned in the reusable module so ordinary and Online runtimes do not require the versioned database contract. A Staged server module must override those Pricing schema fragments with `isVersionedEnabled: true`, exactly as the existing CMS Staged server does. That server also activates the versioned database/nPublish modules and sets `pricing.publication.runtimeRole: STAGED`. On Staged, create a generic nPublish request with domain `pricing`, root type `PRICE_LIST`, root code, and exact source version. nPublish freezes the Price List, assignments, Prices, referenced Pricing Groups, and memberships as immutable dependency identities.

The OOTB Pricing contribution seeds two Workflow heads. `pricingPublicationManualFlow` routes first to a human review action and publishes only after `SUCCESS`. `pricingPublicationAutomaticFlow` routes directly to the same automatic publish action. `pricing.workflow.defaultMode` selects the default and each submission may explicitly select an allowed mode. This preserves the principle that a workflow is a collection of independently manual or automatic actions; the publisher itself is always automatic after approval.

Submission requires a stable `submissionCode`, Price List code, exact positive Staged source version, and one or more associated `{schemaName, code, versionId}` items. The enterprise-scoped carrier identity makes retries idempotent. Associated item identities become approval evidence, while the Pricing publication adapter remains responsible for freezing the complete dependency graph. Projects may replace the workflow graph through later init-data contributions without replacing the Workflow engine or nPublish lifecycle.

After validation and the configured Workflow approval, the Pricing version provider:

1. Requires `pricing.publication.runtimeRole: STAGED`.
2. Builds an integrity-hashed immutable manifest.
3. Uses the configured Nodics module transport and internal service token.
4. Requires a named connection to a distinct Online Pricing runtime; `default` is rejected.
5. Sends an idempotent deployment request.

The target requires `runtimeRole: ONLINE` and `publishEnabled !== true`. It verifies manifest hash and contract version, imports the frozen records idempotently, switches the enterprise/Price-List pointer with revision compare-and-set, stores a receipt, and invalidates resolution cache. Rollback reactivates an already deployed immutable manifest through the same authority.

## Configuration

Configure only through layered `properties.js`:

- identity syntax and enterprise requirement;
- statuses and lifecycle transitions;
- scope types and specificity;
- priorities, group types, decimal bounds, unit-factor bound, and candidate limits;
- reference providers;
- exact-currency or explicitly provided conversion policy;
- cache channel, TTL, and key bounds;
- Storefront introspection module, bootstrap tenant, timeout, retry, response-size, and local/co-hosted preference;
- Staged/Online role, target module connection, retries, timeout, size, and manifest contract versions.
- workflow enablement, allowed modes, default mode, workflow codes, and associated-item bounds.

Never place these runtime settings in `package.json`.

## Security and data protection

Generated CRUD routers are disabled. Human management routes accept access tokens only and use `pricing.backoffice.read`, `pricing.backoffice.manage`, or `pricing.backoffice.preview`. Internal price resolution and Online target routes use `authSecurity.internalToken.routePermission`. The public Storefront delivery route grants no mutation authority and requires active audience-bound introspection before Pricing constructs trusted identity and commercial scope. Enterprise ownership never comes from a browser payload. Arbitrary query operators, provider URLs, credentials, and executable rules are not accepted. Target messages carry service authentication and correlation identity; manifests contain commercial configuration, not credentials.

## Performance and observability

Reads are bounded by `maximumCandidates` and group-member limits. Online responses can be cached through the configured nCache channel, which may use local, Redis, or Hazelcast without Pricing coupling to an adapter. Cache keys hash enterprise plus the complete request. Explicit historical-time evaluations bypass cache by default. Writes, successful activation, and rollback invalidate the Pricing prefix across the selected cache provider.

Operations should record request/correlation ID, tenant, enterprise, selected Price/List/Assignment codes, evaluated time, publication code and revision, manifest hash, target receipt, cache outcome, duration, and sanitized error code. Do not log customer secrets, service tokens, or entire manifests.

## Failure and recovery

- **No list (`ERR_PRICE_00033`)**: verify assignments, scopes, status, dates, and authenticated enterprise.
- **No price (`ERR_PRICE_00034`)**: verify item/group membership, quantity tier, currency, Unit, channel, and validity.
- **Ambiguity (`ERR_PRICE_00035`)**: correct overlapping assignments or Price records; do not disable fail-closed behavior merely to hide bad configuration.
- **Management forbidden (`ERR_PRICE_00022`)**: use a human access token with the necessary permission; never reuse a service token.
- **Invalid management input (`ERR_PRICE_00023`)**: use a documented resource and scalar filters only.
- **Preview overlap**: inspect conflicts, narrow dates or qualifiers, retire the obsolete record, then preview again.
- **Staged role failure**: enable Pricing publication only on the versioned Staged runtime.
- **Target unavailable**: keep the publication approved but not Online, restore module connectivity/service authentication, then retry idempotently.
- **Integrity failure**: reject the manifest, investigate transport/storage corruption, and regenerate from the frozen Staged version.
- **Pointer conflict**: reload Online status and retry through nPublish; never edit the pointer directly.
- **Bad Online release**: request rollback through nPublish to a previously deployed manifest.
- **Rejected workflow**: correct the Staged records and submit a new governed release; no Online deployment occurs.
- **Workflow unavailable (`ERR_PRICE_00027`)**: verify the Workflow module and Pricing workflow seed data are active on Staged; do not bypass approval with direct publication calls.
- **Invalid submission (`ERR_PRICE_00026`)**: provide stable submission identity, exact Staged version, and bounded associated versioned items.
- **Storefront context required (`ERR_PRICE_00065`)**: resolve the current hostname again and send the new opaque handle; verify Storefront, its security-state cache, and service-token introspection rather than accepting caller scope.

## Customization

Use later modules to override properties or compose providers. To add a scope, add the type and specificity, supply trusted context in an override of `scopeValues`, configure reference validation when applicable, and add resolution/publication/cache tests. Do not copy schemas, fork the resolver, create a new publisher, or access a cache adapter directly.

## Verification

Focused tests cover schema/interceptor contracts, tenant isolation, exact values, ranking, ambiguity, publication boundaries, human/service separation, safe projections, hostile filters, enterprise-field stripping, retirement, conflict preview, and non-persistent simulation.

Run:

```bash
node gComm/pricing/test/pricingFoundationContract.test.js
node gComm/pricing/test/priceResolutionContract.test.js
node gComm/pricing/test/pricingStorefrontResolutionContract.test.js
node gComm/pricing/test/pricingPublicationContract.test.js
node gComm/pricing/test/pricingManagementContract.test.js
node gComm/pricing/test/pricingPublicationWorkflowContract.test.js
node startio/envs/startioLocal/startioLocalCmsOnlineServer/test/publicationTopologyContract.test.js
```
