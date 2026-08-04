/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/src/utils/statusDefinitions
 * @description Reserved Payment status-definition registry.
 * @layer utility
 * @owner payment
 * @override Project payment modules may add status helpers without bypassing configured payment policy.
 */
module.exports = {
  SUC_PAY_00001: {
    code: "200",
    message: "Payment provider lifecycle action completed successfully",
  },
  ERR_PAY_00001: {
    code: "400",
    message: "Payment policy request is invalid",
  },
  ERR_PAY_00002: {
    code: "502",
    message: "Payment provider gateway operation failed",
  },
  ERR_PAY_00003: {
    code: "402",
    message: "Payment checkout authorization failed",
  },
  ERR_PAY_00004: {
    code: "502",
    message: "Payment refund operation failed",
  },
  ERR_PAY_00005: {
    code: "409",
    message: "Payment refund calculation failed",
  },
  ERR_PAY_00006: {
    code: "400",
    message: "Payment method policy is invalid",
  },
  ERR_PAY_00007: {
    code: "500",
    message: "Payment provider registry operation failed",
  },
  ERR_PAY_00008: {
    code: "400",
    message: "Payment provider policy is invalid",
  },
  ERR_PAY_00009: {
    code: "400",
    message: "Payment provider lifecycle action is invalid",
  },
  ERR_PAY_00010: {
    code: "400",
    message: "Payment provider connector reference is invalid",
  },
  ERR_PAY_00011: { code: "400", message: "Payment cancellation execution request is invalid" },
  ERR_PAY_00012: { code: "409", message: "Payment cancellation reversal is not eligible" },
  ERR_PAY_00013: { code: "409", message: "Payment cancellation execution requires reconciliation" },
  ERR_PAY_00014: { code: "502", message: "Payment refund execution requires reconciliation" },
  ERR_PAY_00018: { code: "409", message: "Payment refund provider outcome is invalid or conflicts with persisted state" },
};
