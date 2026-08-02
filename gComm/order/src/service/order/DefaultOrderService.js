/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/service/DefaultOrderService
 * @description Order service implementation that prepares tenant-aware order persistence context and starts create/calculation pipelines.
 * @layer service
 * @owner order
 * @override Project modules may override this service to customize order creation, persistence, or workflow orchestration.
 * @property {Object} SERVICE.DefaultPipelineService Executes configured order pipelines.
 * @property {Object} NODICS Provides tenant-aware generated model access.
 */
module.exports = {
  /**
   * Initializes the order service during Nodics service registration.
   *
   * @param {Object} options Module loader options supplied during startup.
   * @returns {Promise<boolean>} Resolves when service initialization is complete.
   */
  init: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },
  /**
   * Finalizes order service startup after module artifacts are registered.
   *
   * @param {Object} options Module loader options supplied during startup.
   * @returns {Promise<boolean>} Resolves when post-initialization is complete.
   */
  postInit: function (options) {
    return new Promise((resolve, reject) => {
      resolve(true);
    });
  },

  /**
   * Creates an order through the configured create-order pipeline.
   *
   * @param {Object} request Nodics request context.
   * @param {string} request.tenant Active tenant used to resolve generated models.
   * @param {Object} request.model Order payload prepared by the caller.
   * @returns {Promise<Object>} Pipeline result for order creation.
   * @sideEffects Sets `request.schemaModel`, `request.moduleName`, and `request.orderService` for downstream pipeline nodes.
   * @throws Wraps pipeline errors in `ERR_ORD_00000`.
   */
  createOrder: function (request) {
    request.schemaModel = NODICS.getModels("order", request.tenant).OrderModel;
    request.moduleName = request.moduleName || request.schemaModel.moduleName;
    request.orderService = this;
    return new Promise((resolve, reject) => {
      SERVICE.DefaultPipelineService.start("createOrderPipeline", request, {})
        .then((success) => {
          resolve(success);
        })
        .catch((error) => {
          reject(new CLASSES.NodicsError(error, null, "ERR_ORD_00000"));
        });
    });
  },

  /**
   * Calculates or reconciles an order through the configured aggregate order calculation pipeline.
   *
   * @param {Object} request Nodics request context.
   * @param {string} request.tenant Active tenant.
   * @param {Object} [request.model] Optional order aggregate or calculation payload.
   * @param {string} [request.orderCode] Order code to calculate.
   * @param {string} [request.lifecycleOperation] Explicit order lifecycle operation requiring recalculation.
   * @returns {Promise<Object>} Calculation pipeline result.
   * @sideEffects Sets `request.calculationPipelineName` and normalized `request.orderCode`.
   * @throws Rejects historical recalculation without lifecycle operation and wraps pipeline errors in `ERR_ORD_00000`.
   */
  calculateOrder: function (request) {
    let model = request.model || request.body || {};
    let calculationConfig = (CONFIG.get("order") || {}).calculation || {};
    request.orderCode =
      request.orderCode || model.orderCode || model.code || request.code;
    request.entCode =
      request.entCode ||
      model.entCode ||
      (request.authData && request.authData.entCode);
    request.lifecycleOperation =
      request.lifecycleOperation ||
      model.lifecycleOperation ||
      model.reasonCode;
    request.calculationPipelineName =
      (calculationConfig.orderPipeline || {}).name ||
      "orderCalculationPipeline";
    if (
      (calculationConfig.historicalEvidencePolicy || {})
        .recalculationRequiresLifecycleOperation &&
      !request.lifecycleOperation
    ) {
      return Promise.reject(
        new CLASSES.NodicsError(
          "Order calculation requires an explicit lifecycleOperation because order entries preserve historical checkout evidence",
          null,
          "ERR_ORD_00000",
        ),
      );
    }
    return new Promise((resolve, reject) => {
      SERVICE.DefaultPipelineService.start(
        request.calculationPipelineName,
        request,
        {},
      )
        .then((success) => {
          resolve(success);
        })
        .catch((error) => {
          reject(new CLASSES.NodicsError(error, null, "ERR_ORD_00000"));
        });
    });
  },
};
