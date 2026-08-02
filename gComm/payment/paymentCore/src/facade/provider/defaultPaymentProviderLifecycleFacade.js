/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/facade/provider/DefaultPaymentProviderLifecycleFacade
 * @description Delegates safe provider lifecycle execution to the Payment-owned lifecycle service.
 * @layer facade
 * @owner payment
 * @override Customer modules may decorate lifecycle orchestration while preserving safe Payment response envelopes.
 */
module.exports = {
    /** Initializes the facade. */
    init: function () { return Promise.resolve(true); },
    /** Completes facade initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Executes one lifecycle action and returns a client-safe envelope. */
    execute: async function (request) {
        return {
            code: 'SUC_PAY_00001',
            data: await SERVICE.DefaultPaymentProviderLifecycleService.execute(request)
        };
    }
};
