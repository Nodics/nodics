/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cyberSourceProvider @description CyberSource provider adapter lifecycle. @layer module @owner cyberSourceProvider */
module.exports = {
    init: function () { return Promise.resolve(true); },
    postInit: function () {
        if (typeof SERVICE !== "undefined" && SERVICE.DefaultPaymentProviderGatewayService && SERVICE.DefaultCyberSourcePaymentProviderAdapterService) {
            SERVICE.DefaultPaymentProviderGatewayService.register("cyberSourceProvider", SERVICE.DefaultCyberSourcePaymentProviderAdapterService);
        }
        return Promise.resolve(true);
    },
    deInit: function () {
        if (typeof SERVICE !== "undefined" && SERVICE.DefaultPaymentProviderGatewayService) {
            SERVICE.DefaultPaymentProviderGatewayService.unregister("cyberSourceProvider");
        }
        return Promise.resolve(true);
    },
};
