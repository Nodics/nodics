# Product Release-Readiness Evidence

This page records the verified P4 acceptance boundary for the implemented
Product capability. It is an evidence map, not a second test runner or runtime
authority. Product tests exercise Product behavior; Nodics release suites own
cross-module and regression execution.

## Acceptance evidence

| Required behavior | Expected result | Primary automated evidence |
| --- | --- | --- |
| Valid Product creation and references | Enterprise identity is derived and Catalog/Units references resolve | `productFoundationContract.test.js` |
| Invalid type, reference, identity, or lifecycle input | Operation fails closed without creating a parallel authority | Foundation, Category, Classification, Variant, and Composition contract tests |
| Tenant and enterprise isolation | Reads and writes cannot cross authenticated scope | `productFoundationContract.test.js`, `productManagementAndReferenceContract.test.js`, `productOnlineDeliveryAndProjectionContract.test.js` |
| Human and internal authentication separation | Human management/operations use access tokens; publication and reference transport use service tokens | Management, Publication, and Online Delivery contract tests |
| Missing exact source or frozen dependency | Publication is rejected before Online activation | `productPublicationContract.test.js` |
| Oversized dependency graph or manifest | Configured bounds reject the release | `productPublicationContract.test.js` |
| Duplicate submission or delivery | Existing immutable manifest and receipt are reused idempotently | `productPublicationContract.test.js` |
| Unsupported contract or tampered manifest | Online rejects the payload before import or pointer activation | `productPublicationContract.test.js` |
| Stale Online pointer revision | Atomic activation fails and the previous release remains active | `productPublicationContract.test.js` |
| Target outage | Staged publication fails closed and the previous Online release remains authoritative | Product publication contract and modular topology publication probe |
| Cache or search projection failure | Online activation remains valid; durable job records incomplete work | `productOnlineDeliveryAndProjectionContract.test.js` |
| Projection retry | Reconciliation retries only unfinished work | `productOnlineDeliveryAndProjectionContract.test.js` |
| Rollback | A previously accepted manifest is reactivated and a rollback receipt is retained | `productPublicationContract.test.js` |
| Restart recovery | Module registration and publication state recover in modular topology | `startioLocalRuntimeTopology.test.js` |
| Layered customization | Configured item types and providers remain replaceable without copying authorities | `productProviderAndOverrideContract.test.js` and the Product LLM examples |

## Operator acceptance procedure

1. Confirm Staged and Online use separate databases or schemas and that only
   Staged enables Product versioning.
2. Confirm the target connection uses internal module authentication. Never put
   a human username/password token on the publication route.
3. Publish an approved test release and verify its manifest hash, receipt,
   active pointer revision, and projection job.
4. Repeat the same delivery and verify that it creates no duplicate receipt.
5. Simulate an unavailable target and verify that the earlier Online pointer is
   unchanged. Restore the target and retry through `nPublish`.
6. Simulate a search projection failure, verify the `PARTIAL` job, restore the
   provider, and run bounded reconciliation.
7. Roll back to the earlier accepted manifest and verify the pointer, receipt,
   cache invalidation, and search projection state.

Production sizing must use representative enterprise Catalog volume and the
deployment's actual database, network, cache, and search providers. The
contract tests prove correctness and bounds; they do not claim universal
capacity figures.

## Verification commands

Run every `gComm/product/test/*.test.js` test, then regenerate LLM context and
run `npm run build`, `npm run quality:docs`, and `npm run test:full`. The release
is acceptable only when focused, generated, security, topology, integration,
and regression checks all pass.

When a Product source, configuration, contract, or test changes, regenerate
the module context rather than editing `llm/generated/` by hand.
