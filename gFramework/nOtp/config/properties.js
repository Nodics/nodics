/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module gFramework/nOtp/config/properties
 * @description Defines default nOtp configuration used during module startup and layering.
 * @layer config
 * @owner nOtp
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {

    token: {
        OTP: {
            rangeStart: 1000,
            rangeEnd: 9000,
            validUpTo: 300, //this value is in secound
            attemptLimit: 5,
            tokenHandler: 'DefaultOtpHandlerService'
        }
    }
};