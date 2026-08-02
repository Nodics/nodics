/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module gFramework/nOtp/src/router/routers
 * @description Defines nOtp route registration and HTTP exposure metadata.
 * @layer router
 * @owner nOtp
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    otp: {
        generateOTP: {
            generateOtp: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/generate',
                method: 'POST',
                controller: 'DefaultOtpController',
                operation: 'generateOtp',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'Post',
                    url: 'http://host:port/nodics/otp/generate',
                    body: {
                        key: 'uniquly identify value',
                        ops: 'Operation name for that OTP been generated'
                    }
                }
            },
        },

        validateOTP: {
            validateOtp: {
                secured: true,
                accessGroups: ['userGroup'],
                key: '/validate',
                method: 'POST',
                controller: 'DefaultOtpController',
                operation: 'validateOtp',
                help: {
                    requestType: 'secured',
                    message: 'Authorization: Bearer <token> header is preferred; legacy authToken header is deprecated',
                    method: 'Post',
                    url: 'http://host:port/nodics/otp/validate',
                    body: {
                        key: 'uniquly identify value',
                        ops: 'Operation name for that OTP been generated',
                        value: 'Generated OTP'
                    }
                }
            },
        }

    }
};