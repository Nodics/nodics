/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gOptional/kyc/kycCore/config/properties
 * @description Defines default kyc configuration used during module startup and layering.
 * @layer config
 * @owner kyc
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    token: {
        OTP: {
            validUpTo: 600, //this value is in secound
            attemptLimit: 5,
            singleUseToken: true
        }
    },
    kyc: {
        responseMapping: {
            default: {
                decision: 'ERROR',
                message: 'Operation facing issue'
            },
            SUC_TKN_00001: {
                decision: 'SUCCESS',
                message: 'Mobile number OTP verified successfully'
            },
            ERR_TKN_00001: {
                decision: 'ERROR',
                message: 'Token expired'
            },
            ERR_TKN_00002: {
                decision: 'ERROR',
                message: 'No token available'
            },
            ERR_TKN_00003: {
                decision: 'RETRY',
                message: 'Invalid token'
            }

        }
    }
};