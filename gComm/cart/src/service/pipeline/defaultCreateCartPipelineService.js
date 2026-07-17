/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cart/service/pipeline/DefaultCreateCartPipelineService
 * @description Pipeline node service for create-cart orchestration, including request validation, nested cart validation, persistence, and terminal handling.
 * @layer pipeline
 * @owner cart
 * @override Project modules may replace individual node handlers or override the pipeline definition to customize cart creation flow.
 */
module.exports = {
    /**
     * Initializes create-cart pipeline handlers during service registration.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when handler initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes create-cart pipeline handler startup after module artifacts are registered.
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
     * Entry node for create-cart request validation.
     *
     * @param {Object} request Nodics request context containing the cart model.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the pipeline to the next success node.
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating create cart request');
        process.nextSuccess(request, response);
    },
    /**
     * Persists the cart through the request-scoped cart service.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.cartService Cart service assigned before pipeline execution.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Writes persistence result to `response.success`.
     * @throws Sends `ERR_ORD_00000` to the pipeline error path on persistence failure.
     */
    saveCart: function (request, response, process) {
        this.LOG.debug('Creating cart');
        request.cartService.save(request).then(result => {
            response.success = result;
            console.log('------------------Cart Created--------------------------');
            console.log(response.success);
            console.log('--------------------------------------------');
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_ORD_00000'));
        });
    },

    /**
     * Executes post-persistence validation or enrichment before the success terminal.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the pipeline to the success terminal.
     */
    postValidation: function (request, response, process) {
        this.LOG.debug('Executing post validation');
        process.nextSuccess(request, response);
    },

    /**
     * Resolves create-cart pipeline execution with the persisted cart result.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context containing `success`.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Resolves the pipeline promise.
     */
    handleSucessEnd: function (request, response, process) {
        this.LOG.debug('Request has been processed successfully');
        process.resolve(response.success);
    },

    /**
     * Rejects create-cart pipeline execution with the accumulated error.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context containing `error`.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Rejects the pipeline promise.
     */
    handleErrorEnd: function (request, response, process) {
        this.LOG.error('Request has been processed and got errors');
        process.reject(response.error);
    }
};
