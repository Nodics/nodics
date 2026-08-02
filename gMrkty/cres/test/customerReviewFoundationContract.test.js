/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/test/customerReviewFoundationContract
 * @description Validates the CRES customer review and rating foundation model, governance service, and Axis metadata.
 * @layer test
 * @owner cres
 * @override Extend when CRES adds moderation workflow, search projection, or customer-facing review APIs.
 */
const assert = require("assert");

const properties = require("../config/properties");
const schemas = require("../src/schemas/schemas").cres;
const interceptors = require("../src/interceptors/interceptors");
const statusDefinitions = require("../src/utils/statusDefinitions");
const reviewGovernance = require("../src/service/defaultCustomerReviewGovernanceService");

global.CONFIG = {
  get: function (key) {
    return properties[key];
  },
};
global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(code, message) {
      super(message || code);
      this.code = code;
    }
  },
};

[
  "customerReview",
  "customerReviewModerationEvent",
  "customerReviewAbuseReport",
  "customerReviewAggregate",
].forEach((schemaName) => {
  assert(
    schemas[schemaName],
    schemaName + " must be a first-class CRES schema",
  );
  assert.strictEqual(
    schemas[schemaName].model,
    true,
    schemaName + " must generate a model",
  );
  assert.strictEqual(
    schemas[schemaName].service.enabled,
    true,
    schemaName + " must generate a service",
  );
});
assert.strictEqual(
  schemas.reviewTest,
  undefined,
  "CRES must not keep placeholder reviewTest as the review authority",
);
assert.strictEqual(schemas.customerReview.router.enabled, true);
assert.strictEqual(schemas.customerReviewAggregate.router.enabled, true);
assert.strictEqual(
  schemas.customerReviewModerationEvent.router.enabled,
  false,
  "moderation evidence should be written by governed services/workflows, not casual public CRUD",
);
assert.strictEqual(
  schemas.customerReviewAbuseReport.refSchema.reviewCode.schemaName,
  "customerReview",
);
assert.strictEqual(
  schemas.customerReviewModerationEvent.refSchema.reviewCode.schemaName,
  "customerReview",
);
assert.strictEqual(
  schemas.customerReview.definition.mediaCodes.description.includes(
    "nMedia-owned",
  ),
  true,
);

assert.strictEqual(
  interceptors.validateCustomerReviewSave.handler,
  "DefaultCustomerReviewGovernanceService.validateReviewSave",
);
assert.strictEqual(
  interceptors.validateCustomerReviewUpdate.handler,
  "DefaultCustomerReviewGovernanceService.validateReviewUpdate",
);
assert.strictEqual(
  interceptors.validateCustomerReviewModerationEventSave.handler,
  "DefaultCustomerReviewGovernanceService.validateModerationEventSave",
);
assert.strictEqual(
  interceptors.validateCustomerReviewAbuseReportSave.handler,
  "DefaultCustomerReviewGovernanceService.validateAbuseReportSave",
);
assert.strictEqual(
  statusDefinitions.ERR_CRES_00002.message,
  "Customer review is invalid",
);

const navigation = properties.backofficeCapabilities.cres.navigation;
assert.deepStrictEqual(
  navigation.map((item) => item.id),
  ["customer-reviews", "review-aggregates", "review-abuse-reports"],
);
assert.deepStrictEqual(navigation[0].workbenchTarget, {
  moduleName: "cres",
  schemaName: "customerReview",
});
assert(
  navigation.every(
    (item) =>
      item.help &&
      item.help.documentationRoute ===
        "/docs/capabilities/commerce/customer-reviews-and-ratings",
  ),
  "CRES BackOffice links must point to framework documentation",
);

assert.strictEqual(
  reviewGovernance.validateReviewSave({
    model: {
      code: "review-1",
      targetType: "PRODUCT",
      targetCode: "sku-1",
      customerCode: "customer-1",
      rating: 5,
      title: "Great",
      comment: "Works well",
      status: "APPROVED",
    },
  }),
  true,
);
assert.throws(
  () =>
    reviewGovernance.validateReviewSave({
      model: {
        code: "review-2",
        targetType: "PRODUCT",
        targetCode: "sku-1",
        customerCode: "customer-1",
        rating: 6,
        status: "APPROVED",
      },
    }),
  /rating is outside policy bounds/,
);
assert.throws(
  () =>
    reviewGovernance.validateReviewSave({
      model: {
        code: "review-3",
        targetType: "UNKNOWN",
        targetCode: "sku-1",
        customerCode: "customer-1",
        rating: 4,
        status: "APPROVED",
      },
    }),
  /Invalid CRES review target type/,
);

assert.strictEqual(
  reviewGovernance.validateModerationEventSave({
    model: {
      reviewCode: "review-1",
      eventType: "APPROVE",
      fromStatus: "PENDING",
      toStatus: "APPROVED",
      actorCode: "contentApprover",
    },
  }),
  true,
);
assert.throws(
  () =>
    reviewGovernance.validateModerationEventSave({
      model: {
        reviewCode: "review-1",
        eventType: "EXECUTE_SCRIPT",
      },
    }),
  /Invalid CRES moderation event type/,
);

assert.strictEqual(
  reviewGovernance.validateAbuseReportSave({
    model: {
      reviewCode: "review-1",
      reporterCode: "customer-2",
      reasonCode: "OFFENSIVE",
      status: "OPEN",
    },
  }),
  true,
);
assert.throws(
  () =>
    reviewGovernance.validateAbuseReportSave({
      model: {
        reviewCode: "review-1",
        reporterCode: "customer-2",
        reasonCode: "OFFENSIVE",
        status: "ESCALATED",
      },
    }),
  /Invalid CRES abuse report status/,
);

const aggregate = reviewGovernance.calculateAggregate("PRODUCT", "sku-1", [
  {
    code: "review-1",
    targetType: "PRODUCT",
    targetCode: "sku-1",
    rating: 5,
    status: "APPROVED",
  },
  {
    code: "review-2",
    targetType: "PRODUCT",
    targetCode: "sku-1",
    rating: 3,
    status: "APPROVED",
  },
  {
    code: "review-3",
    targetType: "PRODUCT",
    targetCode: "sku-1",
    rating: 1,
    status: "REJECTED",
  },
]);
assert.strictEqual(aggregate.ratingTotal, "8");
assert.strictEqual(aggregate.reviewCount, 3);
assert.strictEqual(aggregate.approvedReviewCount, 2);
assert.strictEqual(aggregate.averageRating, "4.00");
assert.strictEqual(aggregate.lastReviewCode, "review-2");

console.log("CRES customer review foundation contract validated");
