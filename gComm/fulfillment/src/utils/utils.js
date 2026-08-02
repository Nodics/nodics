/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module fulfillment/src/utils/utils
 * @description Utility registry for Fulfillment-owned static defaults.
 * @layer utility
 * @owner fulfillment
 * @override Project fulfillment modules may add utility helpers without moving carrier or return lifecycle logic into configuration.
 */
module.exports = {
  defaultFulfillmentProperties: require("./defaultFulfillmentProperties"),
};
