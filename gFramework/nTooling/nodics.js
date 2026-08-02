/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nTooling/nodics
 * @description Module-shaped entrypoint for Nodics development and quality tooling. Package metadata excludes nTooling from application startup; executable commands use dedicated tooling entrypoints instead.
 * @layer module
 * @owner nTooling
 * @override Projects extend tooling through governed command contributions rather than changing this non-runtime compatibility entrypoint.
 */
module.exports = {
    /** @returns {Promise<boolean>} Resolves without registering runtime behavior. */
    init: function () {
        return Promise.resolve(true);
    },

    /** @returns {Promise<boolean>} Resolves without registering runtime behavior. */
    postInit: function () {
        return Promise.resolve(true);
    }
};
