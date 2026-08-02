/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module product @description Lifecycle entrypoint for the Product capability. @layer module @owner product */
module.exports = {
    /** Initializes Product. */ init: function () { return Promise.resolve(true); },
    /** Completes Product initialization. */ postInit: function () { return Promise.resolve(true); }
};
