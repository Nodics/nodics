/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module promotion/controller/DefaultPromotionRepairController @description Maps internal Promotion repair and reconciliation commands to Promotion-owned services. @layer controller @owner promotion */
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
    return Promise.resolve(true);
  },
  /**
   * Executes the run contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
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
  /**
   * Executes the repair contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  repair: function (request, callback) {
    return module.exports.run("repair", request, callback);
  },
  /**
   * Executes the retry contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  retry: function (request, callback) {
    return module.exports.run("retry", request, callback);
  },
  /**
   * Executes the reconcile contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  reconcile: function (request, callback) {
    return module.exports.run("reconcile", request, callback);
  },
};
