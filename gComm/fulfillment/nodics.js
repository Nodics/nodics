/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module fulfillment @description Lifecycle entrypoint for the Fulfillment capability. @layer module @owner fulfillment */
module.exports = {
    /** Executes the init Fulfillment contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Fulfillment contract. */
    postInit: function () { return Promise.resolve(true); },
};
