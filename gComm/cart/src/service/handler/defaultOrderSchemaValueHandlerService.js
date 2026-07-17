/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cart/service/handler/defaultOrderSchemaValueHandlerService
 * @description Helper service for order/cart token value generation and expiry calculation.
 * @layer service
 * @owner cart
 * @override Project modules may replace this handler to use a different token entropy, expiry policy, or external token provider.
 * @property {Object} CONFIG token.ORDER supplies token validity duration in minutes.
 * @property {Object} UTILS Provides hash generation.
 */
module.exports = {
    /**
     * Initializes the token value handler during service registration.
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
     * Finalizes token value handler startup after module artifacts are registered.
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
     * Generates a deterministic hash token from the supplied request payload.
     *
     * @param {Object} request Request or model payload used as the token source.
     * @returns {string} Generated token value.
     * @throws Wraps hash-generation errors in `ERR_TKN_00000`.
     */
    generateToken: function (request) {
        let _self = this;
        try {
            let generatedToken = UTILS.generateHash(JSON.stringify(request));
            _self.LOG.debug('Generated token: ', generatedToken);
            return generatedToken;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating Order Token', 'ERR_TKN_00000');
        }
    },
    /**
     * Calculates token expiry from `token.ORDER.validUpTo` configuration.
     *
     * @param {Object} request Request context; currently used only for signature consistency.
     * @returns {Date} Expiry timestamp.
     * @throws Wraps configuration or date-calculation errors in `ERR_TKN_00000`.
     */
    generateExpiry: function (request) {
        let _self = this;
        try {
            let orderConfig = CONFIG.get('token').ORDER;
            let life = new Date((new Date()).getTime() + orderConfig.validUpTo * (1000 * 60));
            _self.LOG.debug('Token Expire at: ', life);
            return life;
        } catch (error) {
            throw new CLASSES.NodicsError(error, 'While generating token expiry', 'ERR_TKN_00000');
        }
    }
};
