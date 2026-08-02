/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module payment/src/utils/utils
 * @description Utility registry for Payment-owned static defaults.
 * @layer utility
 * @owner payment
 * @override Project payment modules may add utility helpers without moving provider lifecycle logic into configuration.
 */
module.exports = {
  defaultPaymentProperties: require("./defaultPaymentProperties"),
};
