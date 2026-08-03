/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/src/utils/statusDefinitions
 * @description Reserved Fulfillment status-definition registry.
 * @layer utility
 * @owner fulfillment
 * @override Project fulfillment modules may add status helpers without bypassing configured fulfillment policy.
 */
module.exports = {
  SUC_FUL_00001: {
    code: "200",
    message: "Fulfillment lifecycle action completed successfully",
  },
  ERR_FUL_00001: {
    code: "400",
    message: "Fulfillment policy request is invalid",
  },
  ERR_FUL_00002: {
    code: "409",
    message: "Fulfillment release operation failed",
  },
  ERR_FUL_00003: {
    code: "409",
    message: "Fulfillment shipment lifecycle operation failed",
  },
  ERR_FUL_00004: {
    code: "502",
    message: "Shipment label operation failed",
  },
  ERR_FUL_00005: {
    code: "409",
    message: "Warehouse task operation failed",
  },
  ERR_FUL_00006: {
    code: "400",
    message: "Fulfillment mode or tracking event is invalid",
  },
  ERR_FUL_00007: {
    code: "500",
    message: "Fulfillment carrier registry or return request operation failed",
  },
  ERR_FUL_00008: {
    code: "400",
    message: "Fulfillment carrier policy is invalid",
  },
  ERR_FUL_00009: {
    code: "400",
    message: "Fulfillment lifecycle action is invalid",
  },
};
