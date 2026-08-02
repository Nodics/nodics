/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module promotion/src/utils/statusDefinitions
 * @description Stable Promotion error-to-HTTP mappings.
 * @layer utility
 * @owner promotion
 */
module.exports = {
  SUC_PROMOTION_00001: {
    code: "200",
    message: "Promotion operation completed",
  },
  ERR_PROMOTION_00001: {
    code: "401",
    message: "Promotion enterprise scope required",
  },
  ERR_PROMOTION_00002: { code: "400", message: "Promotion code invalid" },
  ERR_PROMOTION_00003: {
    code: "400",
    message: "Promotion code boundary exceeded",
  },
  ERR_PROMOTION_00004: {
    code: "403",
    message: "Promotion enterprise scope mismatch",
  },
  ERR_PROMOTION_00010: {
    code: "400",
    message: "Promotion effective date range invalid",
  },
  ERR_PROMOTION_00011: {
    code: "400",
    message: "Promotion integer field invalid",
  },
  ERR_PROMOTION_00012: {
    code: "400",
    message: "Promotion decimal field invalid",
  },
  ERR_PROMOTION_00013: {
    code: "400",
    message: "Promotion list boundary invalid",
  },
  ERR_PROMOTION_00014: {
    code: "400",
    message: "Promotion metadata boundary invalid",
  },
  ERR_PROMOTION_00015: { code: "400", message: "Promotion status invalid" },
  ERR_PROMOTION_00016: { code: "400", message: "Promotion condition invalid" },
  ERR_PROMOTION_00017: { code: "400", message: "Promotion action invalid" },
  ERR_PROMOTION_00018: {
    code: "409",
    message: "Promotion evidence is immutable",
  },
  ERR_PROMOTION_00019: {
    code: "404",
    message: "Promotion update target not found uniquely",
  },
  ERR_PROMOTION_EVAL_0001: {
    code: "400",
    message: "Promotion evaluation input invalid",
  },
};
