/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module order/service/DefaultOrderService
 * @description Order service implementation that prepares tenant-aware order persistence context and starts the create-order pipeline.
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
        request.schemaModel = NODICS.getModels('order', request.tenant).OrderModel;
        request.moduleName = request.moduleName || request.schemaModel.moduleName;
        request.orderService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('createOrderPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
            });
        });
    }
};
