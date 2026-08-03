/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module order/router/routers
 * @description Reserved order route contribution for custom order APIs beyond generated schema routes.
 * @layer router
 * @owner order
 * @override Project modules may add, remove, or replace order routes through governed router hierarchy contributions.
 */
module.exports = {
  order: {
    orderOperations: {
      calculateOrderByCode: {
        secured: true,
        accessGroups: ["userGroup"],
        key: "/code/:code/calculate",
        method: "POST",
        controller: "DefaultOrderController",
        operation: "calculateOrderByCode",
        help: {
          requestType: "secured",
          message: "authToken need to set within header",
          method: "POST",
          url: "http://host:port/nodics/order/code/:code/calculate",
          body: {
            lifecycleOperation:
              "Required order lifecycle operation such as AMENDMENT, RETURN, REFUND, ADJUSTMENT, or RECONCILIATION",
            orderEntries: "Optional preloaded order entries for calculation",
            orderDeliveryGroups: "Optional preloaded delivery groups",
            orderPaymentGroups: "Optional preloaded payment groups",
            orderDeliveryAllocations: "Optional preloaded delivery allocations",
            orderPaymentAllocations: "Optional preloaded payment allocations",
          },
        },
      },
    },
  },
};
