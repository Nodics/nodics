/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const _ = require('lodash');

/**
 * @module cart/controller/DefaultCartController
 * @description HTTP-facing cart controller that maps secured cart routes to cart facade operations.
 * @layer controller
 * @owner cart
 * @override Project modules may replace this controller or override individual cart routes in a later router contribution.
 * @property {Object} FACADE.DefaultCartFacade Delegates cart create and load operations to the facade layer.
 */
module.exports = {
    /**
     * Initializes the cart controller during Nodics service registration.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when controller initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    /**
     * Finalizes cart controller startup after all module artifacts are registered.
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
     * Creates a cart from the HTTP request body.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper.
     * @param {Object} request.httpRequest.body Cart payload to persist.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when no callback is supplied.
     * @sideEffects Copies `httpRequest.body` into `request.model` before facade delegation.
     * @throws Propagates facade errors through callback or rejected promise.
     */
    createCart: function (request, callback) {
        request.model = request.httpRequest.body;
        if (callback) {
            FACADE.DefaultCartFacade.createCart(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCartFacade.createCart(request);
        }
    },
    /**
     * Loads a cart by merchant reference code for the authenticated enterprise.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper containing `params.refCode`.
     * @param {Object} request.authData Authenticated user and enterprise metadata.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when no callback is supplied.
     * @sideEffects Builds `request.query` with `refCode` and authenticated `entCode`.
     * @throws Propagates facade errors through callback or rejected promise.
     */
    loadCartByRefCode: function (request, callback) {
        request.query = {
            refCode: request.httpRequest.params.refCode,
            entCode: request.authData.entCode
        }
        if (callback) {
            FACADE.DefaultCartFacade.loadCart(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCartFacade.loadCart(request);
        }
    },
    /**
     * Loads a cart by generated cart code for the authenticated enterprise.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper containing `params.code`.
     * @param {Object} request.authData Authenticated user and enterprise metadata.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when no callback is supplied.
     * @sideEffects Builds `request.query` with `code` and authenticated `entCode`.
     * @throws Propagates facade errors through callback or rejected promise.
     */
    loadCartByCode: function (request, callback) {
        request.query = {
            code: request.httpRequest.params.code,
            entCode: request.authData.entCode
        }
        if (callback) {
            FACADE.DefaultCartFacade.loadCart(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCartFacade.loadCart(request);
        }
    },
    /**
     * Loads a cart by token for the authenticated enterprise.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.httpRequest Express request wrapper containing `params.token`.
     * @param {Object} request.authData Authenticated user and enterprise metadata.
     * @param {Function} [callback] Optional Node-style callback.
     * @returns {Promise|undefined} Promise when no callback is supplied.
     * @sideEffects Builds `request.query` with `token` and authenticated `entCode`.
     * @throws Propagates facade errors through callback or rejected promise.
     */
    loadCartByToken: function (request, callback) {
        request.query = {
            token: request.httpRequest.params.token,
            entCode: request.authData.entCode
        }
        if (callback) {
            FACADE.DefaultCartFacade.loadCart(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.DefaultCartFacade.loadCart(request);
        }
    },
};
