/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

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