/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module notifyCore/src/service/defaultSampleService
 * @description Empty module-creation placeholder that demonstrates the service lifecycle shape until concrete services are added.
 * @layer service
 * @owner generated
 * @override Later active modules may override these methods through the standard service merge path.
 */
module.exports = {
    /**
     * Initializes the empty sample placeholder.
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when initialization completes.
     */
    init: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Finalizes the empty sample placeholder.
     * @param {Object} options Startup options.
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    }
};
