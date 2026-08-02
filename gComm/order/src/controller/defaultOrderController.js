/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/controller/DefaultOrderController
 * @description HTTP-facing Order controller for governed order lifecycle
 * operations beyond generated Schema Workbench routes.
 * @layer controller
 * @owner order
 * @override Project modules may replace this controller or override individual
 * routes through later router contributions.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Calculates or reconciles an order by generated order code.
   *
   * @param {Object} request Nodics request context.
   * @param {Object} request.httpRequest Express request wrapper containing `params.code` and optional aggregate body.
   * @param {Function} [callback] Optional Node-style callback.
   * @returns {Promise|undefined} Promise when no callback is supplied.
   * @sideEffects Copies route/body context into the calculation request before facade delegation.
   * @throws Propagates facade errors through callback or rejected promise.
   */
  calculateOrderByCode: function (request, callback) {
    request.model = request.httpRequest.body || {};
    request.orderCode = request.httpRequest.params.code;
    request.entCode = request.authData && request.authData.entCode;
    request.lifecycleOperation =
      request.model.lifecycleOperation || request.model.reasonCode;
    if (callback) {
      FACADE.DefaultOrderFacade.calculateOrder(request)
        .then((success) => {
          callback(null, success);
        })
        .catch((error) => {
          callback(error);
        });
    } else {
      return FACADE.DefaultOrderFacade.calculateOrder(request);
    }
  },
};
