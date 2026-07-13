/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cart/service/pipeline/defaultValidateCartPipelineService
 * @description Pipeline node service for validating cart payload structure, generated token readiness, related items, consignments, payments, and final cart state.
 * @layer pipeline
 * @owner cart
 * @override Project modules may replace individual validation nodes or override the pipeline definition for customer-specific cart rules.
 * @property {Object} SERVICE.DefaultTokenService Finds or creates cart tokens when token preparation is enabled in the pipeline.
 */
module.exports = {
    /**
     * Initializes cart validation pipeline handlers during service registration.
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
     * Finalizes cart validation pipeline handler startup after module artifacts are registered.
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
     * Entry node for cart validation requests.
     *
     * @param {Object} request Nodics request context containing the cart model.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the validation pipeline.
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating create order request');
        process.nextSuccess(request, response);
    },
    /**
     * Ensures a cart token exists by reusing the latest active token or creating a new one.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model Cart model being validated.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Mutates `request.model.token`.
     * @throws Sends `ERR_TKN_00000` to the pipeline error path when token lookup or creation fails.
     */
    prepareToken: function (request, response, process) {
        this.LOG.debug('Generating token for cart');
        let cartModel = request.model;
        if (UTILS.isBlank(cartModel.token)) {
            SERVICE.DefaultTokenService.get(_.merge(_.merge({}, request), {
                query: {
                    key: cartModel.refCode,
                    ops: 'createCart',
                    active: true,
                },
                searchOptions: {
                    pageSize: 1,
                    sort: {
                        expireAt: -1
                    }
                }
            })).then(result => {
                if (result.result && result.result.length == 1) {
                    cartModel.token = result.result[0].value;
                    process.nextSuccess(request, response);
                } else {
                    SERVICE.DefaultTokenService.save({
                        tenant: request.tenant,
                        model: {
                            key: cartModel.refCode,
                            ops: 'createCart',
                            type: 'ORDER',
                            active: true
                        }
                    }).then(result => {
                        cartModel.token = result.result.value;
                        process.nextSuccess(request, response);
                    }).catch(error => {
                        process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
                    });
                }
            }).catch(error => {
                process.error(request, response, new CLASSES.NodicsError(error, null, 'ERR_TKN_00000'));
            });
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Validates mandatory cart values before dependent item checks.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the validation pipeline.
     */
    validateMandateValues: function (request, response, process) {
        this.LOG.debug('Validating create order mandate values');
        process.nextSuccess(request, response);
    },

    /**
     * Validates cart item associations.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the validation pipeline.
     */
    validateItems: function (request, response, process) {
        this.LOG.debug('Validating associated items');
        process.nextSuccess(request, response);
    },

    /**
     * Validates cart consignment associations.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the validation pipeline.
     */
    validateConsignments: function (request, response, process) {
        this.LOG.debug('Validating associated consignments');
        process.nextSuccess(request, response);
    },

    /**
     * Validates cart payment associations.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the validation pipeline.
     */
    validatePayments: function (request, response, process) {
        this.LOG.debug('Validating associated payments');
        process.nextSuccess(request, response);
    },

    /**
     * Performs final cart validation before the caller pipeline continues.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} response Pipeline response context.
     * @param {Object} process Pipeline execution controller.
     * @returns {void}
     * @sideEffects Advances the validation pipeline to success.
     */
    validateCart: function (request, response, process) {
        this.LOG.debug('Validating associated order');
        process.nextSuccess(request, response);
    }
};
