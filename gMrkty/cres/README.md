# cres Module

`cres` owns the customer review system capability. It provides the module space
for review schemas, moderation lifecycle, rating aggregation, routes, services,
pipelines, interceptors, utilities, and tests.

Use this module for customer review definitions, review lifecycle behavior,
review moderation, abuse reporting, and calculated rating evidence.

Review behavior should remain configurable, tenant-aware, auditable, and generated from source definitions where artifacts are derived.

## Beginner Model

A customer review is a customer's opinion about a business target. The target
can be a product first, but the model is intentionally not product-only. A
project can review a category, order, order entry, store, content item, service,
or custom business object by using the configured `targetType` and `targetCode`
contract.

The foundation schemas are:

| Schema                          | Purpose                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `customerReview`                | Customer-submitted review text, rating, target, customer, optional purchase evidence, lifecycle status, and optional media references. |
| `customerReviewModerationEvent` | Immutable-style moderation evidence such as submit, approve, reject, mark spam, archive, restore, report abuse, and clear report.      |
| `customerReviewAbuseReport`     | Reported review concern with reporter, reason, status, and optional resolution.                                                        |
| `customerReviewAggregate`       | Calculated rating summary by target, including total, count, approved count, average, and last review code.                            |

CRES owns review state and aggregate evidence. Product, catalog, order, store,
CMS, or customer modules own the reviewed business records. They reference
CRES results or call CRES operations; they do not store review lifecycle as
their own duplicate state.

## Lifecycle and Governance

The default review lifecycle is:

```text
DRAFT -> PENDING -> APPROVED
                 -> REJECTED
                 -> SPAM
APPROVED -> ARCHIVED
ARCHIVED -> APPROVED
```

`DefaultCustomerReviewGovernanceService` validates target type, rating bounds,
title/comment limits, status, abuse reports, and moderation event types. The
service also calculates an initial aggregate projection from approved reviews.
Future workflow integration should use Workflow for human approval, escalation,
notifications, abuse handling, and repair, while CRES remains the owner of
review records and aggregate rating evidence.

The default rating range is 1 through 5. Project modules can layer
`cres.review.ratingMinimum`, `cres.review.ratingMaximum`,
`cres.review.allowedTargetTypes`, moderation event types, abuse statuses, and
purchase-evidence requirements in configuration. If behavior needs more than
configuration, replace `DefaultCustomerReviewGovernanceService` in a later
customer module rather than editing framework CRES source.

## Axis and BackOffice

CRES contributes BackOffice capability metadata for Customer Reviews, Review
Aggregates, and Review Abuse Reports. Axis should render these as backend-
driven schema/list/detail/query workspaces using reusable components. Axis
must not implement a second review moderation system or calculate aggregate
ratings in the browser.

## Verification

Run:

```bash
node gMrkty/cres/test/customerReviewFoundationContract.test.js
```
