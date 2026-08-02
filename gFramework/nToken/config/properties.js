/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nToken/config/properties
 * @description Defines default nToken configuration used during module startup and layering.
 * @layer config
 * @owner nToken
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    token: {
        TOKEN: {
            attemptLimit: 5,
        }
        // OTP: {
        //     rangeStart: 1000,
        //     rangeEnd: 9000,
        //     validUpTo: 300 //this value is in secound
        // }
    }
};