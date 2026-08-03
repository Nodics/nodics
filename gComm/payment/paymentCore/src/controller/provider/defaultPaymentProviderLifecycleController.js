/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/controller/provider/DefaultPaymentProviderLifecycleController
 * @description Maps secured Payment provider lifecycle HTTP operations to the Payment facade.
 * @layer controller
 * @owner payment
 * @override Later modules may adapt request mapping while preserving Payment-owned permissions, validation, and secret-redaction boundaries.
 */
module.exports = {
  /** Initializes the controller. */
  init: function () {
    return Promise.resolve(true);
  },
  /** Completes controller initialization. */
  postInit: function () {
    return Promise.resolve(true);
  },
  /** Executes one facade operation with optional callback support. */
  executeFacade: function (operation, request, callback) {
    let body =
      (request && request.httpRequest && request.httpRequest.body) || {};
    let input = Object.assign({}, body, {
      tenant: request && request.tenant,
      authData: request && request.authData,
      entCode: request && request.entCode,
      enterpriseCode:
        body.enterpriseCode || body.entCode || (request && request.entCode),
    });
    let promise = Promise.resolve().then(() =>
      FACADE.DefaultPaymentProviderLifecycleFacade[operation](input),
    );
    if (callback)
      return promise.then((result) => callback(null, result)).catch(callback);
    return promise;
  },
  /** Executes one provider lifecycle action. */
  execute: function (request, callback) {
    return this.executeFacade("execute", request, callback);
  },
};
