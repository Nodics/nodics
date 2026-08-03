/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module checkout/src/utils/commerceCalculationDelegateUtils
 * @description Shared helper for Cart and Order calculation pipeline nodes that
 * delegate calculation authority to owning commerce modules without duplicating
 * price, promotion, tax, inventory, payment, or fulfillment logic.
 * @layer utility
 * @owner checkout
 * @override Customer modules should change delegate configuration or replace
 * individual pipeline nodes, not fork this helper to call CRUD services directly.
 */
module.exports = {
  /**
   * Executes the list contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  list: function (value) {
    return Array.isArray(value) ? value : value ? [value] : [];
  },
  /**
   * Executes the config contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  config: function (moduleName) {
    if (
      typeof CONFIG === "undefined" ||
      !CONFIG ||
      typeof CONFIG.get !== "function"
    )
      return {};
    return CONFIG.get(moduleName) || {};
  },
  /**
   * Executes the registry contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  registry: function () {
    return typeof SERVICE === "undefined" || !SERVICE ? {} : SERVICE;
  },
  /**
   * Executes the error message contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  errorMessage: function (error) {
    return error && error.message ? error.message : String(error);
  },
  /**
   * Executes the delegate configuration contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  delegateConfiguration: function (moduleName, delegateKey) {
    let calculation = this.config(moduleName).calculation || {};
    return (calculation.delegates || {})[delegateKey] || {};
  },
  /**
   * Executes the resolve delegate contract for this module surface.
   *
   * @param {...*} args Governed Nodics runtime arguments for this operation.
   * @returns {*} Operation result, promise, or delegated service response.
   */
  resolveDelegate: async function (moduleName, delegateKey, request, input) {
    let delegate = this.delegateConfiguration(moduleName, delegateKey),
      serviceNames = this.list(delegate.serviceNames),
      operations = this.list(delegate.operations),
      services = this.registry();

    for (let serviceName of serviceNames) {
      let service = services[serviceName];
      if (!service) continue;
      for (let operation of operations) {
        if (typeof service[operation] !== "function") continue;
        try {
          let result = await service[operation](
            Object.assign({}, request || {}, {
              calculationDelegate: {
                moduleName: moduleName,
                delegateKey: delegateKey,
                ownerModule: delegate.ownerModule,
                serviceName: serviceName,
                operation: operation,
              },
              calculationInput: input || {},
            }),
          );
          return {
            status: "DELEGATED",
            ownerModule: delegate.ownerModule,
            serviceName: serviceName,
            operation: operation,
            result: result,
          };
        } catch (error) {
          error.calculationDelegate = {
            moduleName: moduleName,
            delegateKey: delegateKey,
            ownerModule: delegate.ownerModule,
            serviceName: serviceName,
            operation: operation,
            message: this.errorMessage(error),
          };
          throw error;
        }
      }
    }

    return {
      status: "DEFERRED",
      ownerModule: delegate.ownerModule,
      reason:
        delegate.deferredReason ||
        "Configured delegate service is not available",
      serviceNames: serviceNames,
      operations: operations,
    };
  },
};
