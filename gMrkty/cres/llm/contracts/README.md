# cres AI Contracts

This folder contains module-specific AI/developer contracts for `gMrkty/cres`.

Use these files for rules that are more specific than root `AGENTS.md` and the module `AGENTS.md`, especially extension boundaries, override expectations, testing rules, security constraints, and generated-artifact responsibilities.

## Customer review and rating foundation

- `cres` is the owning backend capability for customer reviews and ratings.
  Do not create a parallel review/rating module under Product, Catalog, Order,
  CMS, Axis, or customer applications.
- Reviews are target-based. Product reviews are the first common use case, but
  `targetType` and `targetCode` allow project modules to review categories,
  orders, stores, content, services, or custom business objects.
- CRES owns `customerReview`, `customerReviewModerationEvent`,
  `customerReviewAbuseReport`, and `customerReviewAggregate`.
- Product, Catalog, Order, Store, CMS, and customer modules own their business
  records. They may reference CRES evidence or call CRES operations; they must
  not duplicate review lifecycle state.
- Moderation, approval, abuse handling, notifications, and repair should use
  Workflow when the process requires multiple actions or human decisions.
  Single-record validation remains a service/interceptor responsibility.
- Rating math must remain backend-owned and deterministic. Axis may display
  aggregate evidence but must not calculate authoritative averages in the
  browser.
- Configuration belongs under `cres.review` and `cres.moderation`; runtime
  behavior belongs in `DefaultCustomerReviewGovernanceService` or a later-layer
  replacement service.
- Validate changes with
  `node gMrkty/cres/test/customerReviewFoundationContract.test.js`.
