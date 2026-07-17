/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nTest/controller/testExecutionController
 * @description Controller entrypoint that adapts route request context into test execution facade calls.
 * @layer controller
 * @owner nTest
 * @override Project modules may override this controller to expose additional governed test execution routes.
 */
module.exports = {
    /**
     * Initializes the test execution controller during service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes the test execution controller after service loading.
     *
     * @param {Object} options Loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Runs configured unit tests for the active request tenant and enterprise context.
     *
     * @param {Object} requestContext Nodics request context containing tenant and enterprise code.
     * @param {Function} callback Node-style completion callback.
     * @returns {void}
     */
    runUTest: function (requestContext, callback) {
        let input = {
            tenant: requestContext.tenant,
            entCode: requestContext.entCode
        };
        FACADE.TestExecutionFacade.runUTest(input, callback);
    },

    /**
     * Runs configured Nodics integration tests for the active request tenant and enterprise context.
     *
     * @param {Object} requestContext Nodics request context containing tenant and enterprise code.
     * @param {Function} callback Node-style completion callback.
     * @returns {void}
     */
    runNTest: function (requestContext, callback) {
        let input = {
            tenant: requestContext.tenant,
            entCode: requestContext.entCode
        };
        FACADE.TestExecutionFacade.runNTest(input, callback);
    }
};
