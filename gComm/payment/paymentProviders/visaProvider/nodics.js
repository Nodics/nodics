/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module visaProvider @description Visa provider adapter lifecycle. @layer module @owner visaProvider */
module.exports = {
  /**
   * Executes the init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Executes the post init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  postInit: function () {
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentProviderGatewayService &&
      SERVICE.DefaultVisaPaymentProviderAdapterService
    ) {
      SERVICE.DefaultPaymentProviderGatewayService.register(
        "visaProvider",
        SERVICE.DefaultVisaPaymentProviderAdapterService,
      );
    }
    return Promise.resolve(true);
  },
  /**
   * Executes the de init contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  deInit: function () {
    if (
      typeof SERVICE !== "undefined" &&
      SERVICE.DefaultPaymentProviderGatewayService
    ) {
      SERVICE.DefaultPaymentProviderGatewayService.unregister("visaProvider");
    }
    return Promise.resolve(true);
  },
};
