/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module payment @description Lifecycle entrypoint for the Payment capability. @layer module @owner payment */
module.exports = {
    /** Executes the init Payment contract. */
    init: function () { return Promise.resolve(true); },
    /** Executes the postInit Payment contract. */
    postInit: function () { return Promise.resolve(true); }
};
