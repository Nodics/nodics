/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/facade/DefaultOrderFacade
 * @description Facade boundary for Order operations, keeping controllers
 * independent from Order service implementation details.
 * @layer facade
 * @owner order
 * @override Project modules may replace this facade to add order-specific
 * orchestration while preserving the controller contract.
 */
module.exports = {
  /**
   * Initializes the order facade.
   *
   * @returns {Promise<boolean>} Resolves when the facade is ready.
   */
  init: function () {
    return Promise.resolve(true);
  },
  /**
   * Completes post-start initialization for the order facade.
   *
   * @returns {Promise<boolean>} Resolves when post-initialization succeeds.
   */
  postInit: function () {
    return Promise.resolve(true);
  },
  /**
   * Delegates order creation to the Order service.
   *
   * @param {Object} request Governed order creation request.
   * @returns {Promise|*} Order service response.
   */
  createOrder: function (request) {
    return SERVICE.DefaultOrderService.createOrder(request);
  },
  /**
   * Delegates order calculation or reconciliation to the Order service.
   *
   * @param {Object} request Governed order calculation request.
   * @returns {Promise|*} Order service response.
   */
  calculateOrder: function (request) {
    return SERVICE.DefaultOrderService.calculateOrder(request);
  },
};
