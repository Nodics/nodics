/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    record1: {
        code: "initializeMobileOTP",
        name: "initializeMobileOTP",
        active: true,
        qualifier: {
            decision: 'INITIATE'
        },
        target: 'initializeMobileOTPAction'
    },
    record2: {
        code: "verifyMobileOTP",
        name: "verifyMobileOTP",
        active: true,
        qualifier: {
            decision: 'VALIDATEOTP'
        },
        target: 'verifyMobileOTPAction'
    },
    record3: {
        code: "handleExpiredOTP",
        name: "handleExpiredOTP",
        active: true,
        qualifier: {
            decision: 'EXPIRED'
        },
        target: 'initializeMobileOTPAction'
    },
    record4: { // this may not be needed
        code: "handleRetryOTP",
        name: "handleRetryOTP",
        active: true,
        qualifier: {
            decision: 'RETRY'
        },
        target: 'verifyMobileOTPAction'
    },
    record3: {
        code: "mobileOTPValidated",
        name: "mobileOTPValidated",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'mobileOTPValidatedAction'
    },
};