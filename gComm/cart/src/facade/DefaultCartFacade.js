/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/facade/DefaultCartFacade
 * @description Facade boundary for cart operations, keeping controllers independent from cart service implementation details.
 * @layer facade
 * @owner cart
 * @override Project modules may replace this facade to add commerce-specific orchestration while preserving the controller contract.
 * @property {Object} SERVICE.DefaultCartService Owns cart persistence and pipeline execution.
 */
module.exports = {
    /**
     * Initializes the cart facade during Nodics service registration.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when facade initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Finalizes cart facade startup after module services are available.
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
     * Delegates cart creation to the cart service.
     *
     * @param {Object} request Nodics request context containing `model`, `tenant`, and auth metadata.
     * @returns {Promise<Object>} Cart persistence result from the service layer.
     * @throws Propagates service errors as rejected promises.
     */
    createCart: function (request) {
        return SERVICE.DefaultCartService.createCart(request);
    },
    /**
     * Delegates cart loading to the cart service.
     *
     * @param {Object} request Nodics request context containing a prepared cart query.
     * @returns {Promise<Object>} Cart query result from the service layer.
     * @throws Propagates service errors as rejected promises.
     */
    loadCart: function (request) {
        return SERVICE.DefaultCartService.loadCart(request);
    }
};
