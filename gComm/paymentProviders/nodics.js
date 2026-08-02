/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviders
 * @description Payment provider-family lifecycle entrypoint.
 * @layer module
 * @owner paymentProviders
 * @override Later active modules may override lifecycle behavior without modifying this provider boundary.
 */
module.exports = {
    init: function () {
        return Promise.resolve(true);
    },
    postInit: function () {
        return Promise.resolve(true);
    },
};
