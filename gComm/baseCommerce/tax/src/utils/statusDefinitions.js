/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module tax/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
  SUC_TAX_00001: { code: "200", message: "Tax operation completed" },
  ERR_TAX_00001: { code: "401", message: "Tax enterprise scope required" },
  ERR_TAX_00002: { code: "400", message: "Tax code invalid" },
  ERR_TAX_00003: { code: "400", message: "Tax code boundary exceeded" },
  ERR_TAX_00004: { code: "403", message: "Tax enterprise scope mismatch" },
  ERR_TAX_00010: { code: "400", message: "Tax effective date range invalid" },
  ERR_TAX_00011: { code: "400", message: "Tax decimal field invalid" },
  ERR_TAX_00012: { code: "400", message: "Tax currency code invalid" },
  ERR_TAX_00013: { code: "400", message: "Tax country code invalid" },
  ERR_TAX_00014: { code: "400", message: "Tax jurisdiction invalid" },
  ERR_TAX_00015: { code: "400", message: "Tax provider status invalid" },
  ERR_TAX_00016: { code: "400", message: "Tax provider type invalid" },
  ERR_TAX_00017: { code: "400", message: "Tax provider adapter invalid" },
  ERR_TAX_00018: { code: "400", message: "Tax provider operation invalid" },
  ERR_TAX_00019: { code: "400", message: "Tax rate type invalid" },
  ERR_TAX_00020: { code: "400", message: "Tax calculation mode invalid" },
  ERR_TAX_00021: { code: "400", message: "Tax rate identity invalid" },
  ERR_TAX_00022: { code: "400", message: "Tax calculation request invalid" },
  ERR_TAX_00023: { code: "400", message: "Tax lifecycle status invalid" },
  ERR_TAX_00024: { code: "409", message: "Tax identity is immutable" },
  ERR_TAX_00025: {
    code: "404",
    message: "Tax update target not found uniquely",
  },
  ERR_TAX_00026: { code: "400", message: "Tax quote request invalid" },
  ERR_TAX_00027: { code: "400", message: "Tax inclusion mode invalid" },
  ERR_TAX_00008: { code: "400", message: "Tax refund evidence is invalid" },
};
