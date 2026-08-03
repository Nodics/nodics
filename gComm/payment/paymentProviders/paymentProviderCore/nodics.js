/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module paymentProviderCore/nodics
 * @description Shared payment-provider adapter contract and execution-governance lifecycle entry point.
 * @layer module
 * @owner paymentProviderCore
 * @override Project modules may replace adapter contract services while preserving Payment-owned lifecycle authority.
 */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () { return Promise.resolve(true); },
};
