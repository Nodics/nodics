/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gMrkty/cres/src/service/defaultCustomerReviewGovernanceService
 * @description Validates customer review lifecycle data and calculates provider-neutral review aggregates.
 * @layer service
 * @owner cres
 * @override Project modules may extend target types, moderation statuses, evidence requirements, and aggregation behavior through later layers.
 */
module.exports = {
  /**
   * Executes the get review policy contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getReviewPolicy: function () {
    let configuration = CONFIG.get("cres") || {};
    let policy = configuration.review || {};
    if (
      !Array.isArray(policy.allowedTargetTypes) ||
      !Array.isArray(policy.statuses)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_CRES_00001",
        "CRES review policy is incomplete",
      );
    }
    return policy;
  },
  /**
   * Executes the get moderation policy contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  getModerationPolicy: function () {
    let configuration = CONFIG.get("cres") || {};
    let policy = configuration.moderation || {};
    if (
      !Array.isArray(policy.eventTypes) ||
      !Array.isArray(policy.abuseStatuses)
    ) {
      throw new CLASSES.NodicsError(
        "ERR_CRES_00001",
        "CRES moderation policy is incomplete",
      );
    }
    return policy;
  },
  /**
   * Executes the normalize models contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  normalizeModels: function (model) {
    return Array.isArray(model) ? model : [model || {}];
  },
  /**
   * Executes the trim contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  trim: function (value) {
    return typeof value === "string" ? value.trim() : value;
  },
  /**
   * Executes the apply update contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  applyUpdate: function (existing, update) {
    let effective = Object.assign({}, existing || {});
    Object.keys(update || {})
      .filter((key) => !key.startsWith("$"))
      .forEach((key) => {
        effective[key] = update[key];
      });
    Object.assign(effective, (update && update.$set) || {});
    Object.keys((update && update.$unset) || {}).forEach((key) => {
      delete effective[key];
    });
    return effective;
  },
  /**
   * Executes the validate review contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateReview: function (review) {
    let policy = this.getReviewPolicy();
    let normalized = Object.assign({}, review || {});
    [
      "targetType",
      "targetCode",
      "customerCode",
      "orderCode",
      "orderEntryCode",
      "title",
      "comment",
      "status",
      "localeCode",
      "channelCode",
      "moderationReason",
    ].forEach((key) => {
      normalized[key] = this.trim(normalized[key]);
    });
    normalized.status = normalized.status || policy.defaultStatus || "PENDING";
    if (!policy.allowedTargetTypes.includes(normalized.targetType))
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "Invalid CRES review target type",
      );
    if (!policy.statuses.includes(normalized.status))
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "Invalid CRES review status",
      );
    if (!normalized.targetCode)
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "CRES review target code is required",
      );
    if (!normalized.customerCode)
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "CRES review customer code is required",
      );
    if (
      !Number.isSafeInteger(normalized.rating) ||
      normalized.rating < policy.ratingMinimum ||
      normalized.rating > policy.ratingMaximum
    ) {
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "CRES review rating is outside policy bounds",
      );
    }
    if (normalized.title && normalized.title.length > policy.maximumTitleLength)
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "CRES review title exceeds policy limit",
      );
    if (
      normalized.comment &&
      normalized.comment.length > policy.maximumCommentLength
    )
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "CRES review comment exceeds policy limit",
      );
    if (
      policy.requirePurchaseEvidenceForProducts === true &&
      normalized.targetType === "PRODUCT" &&
      !normalized.orderEntryCode
    ) {
      throw new CLASSES.NodicsError(
        "ERR_CRES_00002",
        "Product reviews require purchase evidence",
      );
    }
    return normalized;
  },
  /**
   * Executes the validate review save contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateReviewSave: function (request) {
    this.normalizeModels(request.model).forEach((model) =>
      this.validateReview(model),
    );
    return true;
  },
  /**
   * Executes the validate review update contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateReviewUpdate: function (request) {
    let updates = this.normalizeModels(request.model);
    if (!request.query || !SERVICE.DefaultCustomerReviewService) {
      updates.forEach((model) => this.validateReview(model));
      return true;
    }
    return SERVICE.DefaultCustomerReviewService.get({
      tenant: request.tenant,
      authData: request.authData,
      query: request.query,
      options: { recursive: false },
    }).then((result) => {
      let existing = (result && result.result) || [];
      if (existing.length === 0)
        throw new CLASSES.NodicsError(
          "ERR_CRES_00002",
          "CRES review update requires an existing review",
        );
      existing
        .map((review) => this.applyUpdate(review, updates[0]))
        .forEach((review) => this.validateReview(review));
      return true;
    });
  },
  /**
   * Executes the validate moderation event contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateModerationEvent: function (event) {
    let policy = this.getModerationPolicy();
    if (!event || !event.reviewCode)
      throw new CLASSES.NodicsError(
        "ERR_CRES_00003",
        "CRES moderation event requires reviewCode",
      );
    if (!policy.eventTypes.includes(event.eventType))
      throw new CLASSES.NodicsError(
        "ERR_CRES_00003",
        "Invalid CRES moderation event type",
      );
    return true;
  },
  /**
   * Executes the validate abuse report contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateAbuseReport: function (report) {
    let policy = this.getModerationPolicy();
    let status =
      (report && report.status) || policy.defaultAbuseStatus || "OPEN";
    if (
      !report ||
      !report.reviewCode ||
      !report.reporterCode ||
      !report.reasonCode
    ) {
      throw new CLASSES.NodicsError(
        "ERR_CRES_00004",
        "CRES abuse report requires review, reporter, and reason",
      );
    }
    if (!policy.abuseStatuses.includes(status))
      throw new CLASSES.NodicsError(
        "ERR_CRES_00004",
        "Invalid CRES abuse report status",
      );
    return true;
  },
  /**
   * Executes the validate moderation event save contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateModerationEventSave: function (request) {
    this.normalizeModels(request.model).forEach((model) =>
      this.validateModerationEvent(model),
    );
    return true;
  },
  /**
   * Executes the validate abuse report save contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  validateAbuseReportSave: function (request) {
    this.normalizeModels(request.model).forEach((model) =>
      this.validateAbuseReport(model),
    );
    return true;
  },
  /**
   * Executes the calculate aggregate contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  calculateAggregate: function (targetType, targetCode, reviews) {
    let approved = (reviews || []).filter(
      (review) =>
        review.targetType === targetType &&
        review.targetCode === targetCode &&
        review.status === "APPROVED",
    );
    let total = approved.reduce((sum, review) => sum + review.rating, 0);
    let average =
      approved.length === 0
        ? "0.00"
        : (Math.round((total / approved.length) * 100) / 100).toFixed(2);
    return {
      code: targetType + "-" + targetCode,
      targetType: targetType,
      targetCode: targetCode,
      ratingTotal: String(total),
      reviewCount: (reviews || []).filter(
        (review) =>
          review.targetType === targetType && review.targetCode === targetCode,
      ).length,
      approvedReviewCount: approved.length,
      averageRating: average,
      lastReviewCode: approved.length
        ? approved[approved.length - 1].code
        : undefined,
    };
  },
};
