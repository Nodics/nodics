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
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  createOrder: function (request) {
    return SERVICE.DefaultOrderService.createOrder(request);
  },
  calculateOrder: function (request) {
    return SERVICE.DefaultOrderService.calculateOrder(request);
  },
};
