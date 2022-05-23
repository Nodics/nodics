/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    otp: {
        otp: {
            super: 'super',
            model: true,
            service: {
                enabled: true
            },
            cache: {
                enabled: true,
                ttl: 1000
            },
            router: {
                enabled: false,
            },
            definition: {
                otpKey: {
                    type: 'string',
                    required: true,
                    description: 'Primey key for the generated OTP'
                },
                ops: {
                    type: 'string',
                    required: true,
                    description: 'Operation name for that OTP been generated'
                },
                otpValue: {
                    type: 'int',
                    required: true,
                    description: 'Generated otp value',
                    default: 'DefaultOtpHandlerService.generateDefaultOTP',
                },
                expireAt: {
                    type: 'date',
                    required: true,
                    default: 'DefaultOtpHandlerService.generateExpiry',
                    description: 'OTP expiration timestamp',
                    searchOptions: {
                        enabled: true, // default is false
                    }
                }
            }
        },
    }
};