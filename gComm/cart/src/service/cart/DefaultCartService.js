/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/service/DefaultCartService
 * @description Cart service implementation that prepares cart persistence context, starts the create-cart pipeline, and wraps cart read errors.
 * @layer service
 * @owner cart
 * @override Project modules may override this service to customize cart persistence, validation orchestration, or model selection without changing controllers.
 * @property {Object} SERVICE.DefaultPipelineService Executes configured cart pipelines.
 * @property {Object} NODICS Provides tenant-aware generated model access.
 */
module.exports = {
    /**
     * Initializes the cart service during Nodics service registration.
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
     * Finalizes cart service startup after module artifacts are registered.
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
     * Creates a cart through the configured create-cart pipeline.
     *
     * @param {Object} request Nodics request context.
     * @param {string} request.tenant Active tenant used to resolve generated models.
     * @param {Object} request.model Cart payload prepared by the controller.
     * @returns {Promise<Object>} Pipeline result from cart persistence.
     * @sideEffects Sets `request.schemaModel`, `request.moduleName`, and `request.cartService` for downstream pipeline nodes.
     * @throws Wraps pipeline errors in `ERR_ORD_00000`.
     */
    createCart: function (request) {
        request.schemaModel = NODICS.getModels('cart', request.tenant).OrderModel;
        request.moduleName = request.moduleName || request.schemaModel.moduleName;
        request.cartService = this;
        return new Promise((resolve, reject) => {
            SERVICE.DefaultPipelineService.start('createCartPipeline', request, {}).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
            });
        });
    },

    /**
     * Loads cart records through the generated service `get` operation.
     *
     * @param {Object} request Nodics request context containing `query` and `tenant`.
     * @returns {Promise<Object>} Query result returned by the generated persistence service.
     * @throws Wraps generated service errors in `ERR_ORD_00000`.
     */
    loadCart: function (request) {
        let _self = this;
        return new Promise((resolve, reject) => {
            _self.get(request).then(success => {
                resolve(success);
            }).catch(error => {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
            });
        });
    }
};
