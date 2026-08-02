/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module checkout
 * @description Lifecycle entrypoint for shared commerce checkout contracts.
 * @layer module
 * @owner checkout
 * @override Later active modules may override lifecycle behavior without moving
 * owner-specific checkout rules out of Cart, Order, Pricing, Tax, Promotion,
 * Inventory, Payment, or Fulfillment.
 */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
};
