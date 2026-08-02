/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTest/facade/testExecutionFacade
 * @description Facade boundary that delegates governed unit and Nodics test execution to the test service.
 * @layer facade
 * @owner nTest
 * @override Project modules may override this facade to add policy checks before executing tests.
 */
module.exports = {
    /**
     * Initializes the test execution facade during service loading.
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
     * Finalizes the test execution facade after service loading.
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
     * Delegates unit test execution to `TestExecutionService`.
     *
     * @param {Object} input Test execution input containing tenant and enterprise context.
     * @param {Function} callback Node-style completion callback.
     * @returns {void}
     */
    runUTest: function (input, callback) {
        SERVICE.TestExecutionService.runUTest(input, callback);
    },

    /**
     * Delegates Nodics integration test execution to `TestExecutionService`.
     *
     * @param {Object} input Test execution input containing tenant and enterprise context.
     * @param {Function} callback Node-style completion callback.
     * @returns {void}
     */
    runNTest: function (input, callback) {
        SERVICE.TestExecutionService.runNTest(input, callback);
    }

};
