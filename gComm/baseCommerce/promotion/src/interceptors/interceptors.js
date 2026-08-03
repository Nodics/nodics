/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/src/interceptors/interceptors @description Promotion enterprise scoping, validation, immutable evidence, and no-hard-delete hooks. @layer interceptor @owner promotion */
const scoped = function (schema, prepare, update) {
  const result = {};
  result[schema + "PreSave"] = {
    type: "schema",
    item: schema,
    trigger: "preSave",
    active: "true",
    index: -100,
    handler: prepare,
  };
  result[schema + "PreGet"] = {
    type: "schema",
    item: schema,
    trigger: "preGet",
    active: "true",
    index: -100,
    handler: "DefaultPromotionEnterpriseScopeService.scopeQuery",
  };
  result[schema + "PreUpdate"] = {
    type: "schema",
    item: schema,
    trigger: "preUpdate",
    active: "true",
    index: -100,
    handler: update || prepare,
  };
  result[schema + "PreRemove"] = {
    type: "schema",
    item: schema,
    trigger: "preRemove",
    active: "true",
    index: -100,
    handler: "DefaultPromotionValidationService.rejectHardDelete",
  };
  return result;
};

module.exports = Object.assign(
  {},
  scoped(
    "promotionCampaign",
    "DefaultPromotionValidationService.prepareCampaign",
  ),
  scoped("promotionRule", "DefaultPromotionValidationService.prepareRule"),
  scoped(
    "promotionCondition",
    "DefaultPromotionValidationService.prepareCondition",
  ),
  scoped("promotionAction", "DefaultPromotionValidationService.prepareAction"),
  scoped(
    "couponCampaign",
    "DefaultPromotionValidationService.prepareCouponCampaign",
  ),
  scoped("couponCode", "DefaultPromotionValidationService.prepareCouponCode"),
  scoped(
    "promotionEvaluationRun",
    "DefaultPromotionValidationService.prepareEvaluationRun",
    "DefaultPromotionValidationService.prepareReadonlyEvidenceUpdate",
  ),
  scoped(
    "promotionRepairRun",
    "DefaultPromotionValidationService.prepareRepairRun",
  ),
  scoped(
    "appliedPromotion",
    "DefaultPromotionValidationService.prepareAppliedPromotion",
    "DefaultPromotionValidationService.prepareReadonlyEvidenceUpdate",
  ),
);
