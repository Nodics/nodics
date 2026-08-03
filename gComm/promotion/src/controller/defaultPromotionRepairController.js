/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/controller/DefaultPromotionRepairController @description Maps internal Promotion repair and reconciliation commands to Promotion-owned services. @layer controller @owner promotion */
module.exports = {
  init: function () {
    return Promise.resolve(true);
  },
  postInit: function () {
    return Promise.resolve(true);
  },
  run: function (operation, request, callback) {
    const promise = SERVICE.DefaultPromotionRepairService[operation](
      Object.assign({}, request, { repairRequest: request.body || {} }),
    );
    return callback
      ? promise
          .then((value) =>
            callback(null, { code: "SUC_PROMOTION_00001", data: value }),
          )
          .catch(callback)
      : promise.then((value) => ({
          code: "SUC_PROMOTION_00001",
          data: value,
        }));
  },
  repair: function (request, callback) {
    return module.exports.run("repair", request, callback);
  },
  retry: function (request, callback) {
    return module.exports.run("retry", request, callback);
  },
  reconcile: function (request, callback) {
    return module.exports.run("reconcile", request, callback);
  },
};
