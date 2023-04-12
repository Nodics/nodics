/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    // ************************************************  Mobile OTP Channels Start  ****************************************
    record0: {
        code: "initializeMobileOTP",
        name: "initializeMobileOTP",
        active: true,
        qualifier: {
            decision: 'INITIATE'
        },
        target: 'initializeMobileOTPAction'
    },
    record1: {
        code: "notifyUserMobileOTP",
        name: "notifyUserMobileOTP",
        active: true,
        qualifier: {
            decision: 'NOTIFY'
        },
        target: 'notifyUserMobileOTPAction'
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
        code: "handleMobileRetryOTP",
        name: "handleMobileRetryOTP",
        active: true,
        qualifier: {
            decision: 'RETRY'
        },
        target: 'verifyMobileOTPAction'
    },
    record4: {
        code: "mobileOTPValidated",
        name: "mobileOTPValidated",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'mobileOTPValidatedAction'
    },
    // ************************************************  Mobile OTP Channels End  ****************************************
    // ************************************************  Email OTP Channels Start  ****************************************
    record5: {
        code: "initializeEmailOTP",
        name: "initializeEmailOTP",
        active: true,
        qualifier: {
            decision: 'INITIATE'
        },
        target: 'initializeEmailOTPAction'
    },
    record6: {
        code: "notifyUserEmailOTP",
        name: "notifyUserEmailOTP",
        active: true,
        qualifier: {
            decision: 'NOTIFY'
        },
        target: 'notifyUserEmailOTPAction'
    },
    record7: {
        code: "verifyEmailOTP",
        name: "verifyEmailOTP",
        active: true,
        qualifier: {
            decision: 'VALIDATEOTP'
        },
        target: 'verifyEmailOTPAction'
    },
    record8: {
        code: "handleEmailRetryOTP",
        name: "handleEmailRetryOTP",
        active: true,
        qualifier: {
            decision: 'RETRY'
        },
        target: 'verifyEmailOTPAction'
    },
    record9: {
        code: "emailOTPValidated",
        name: "emailOTPValidated",
        active: true,
        qualifier: {
            decision: 'SUCCESS'
        },
        target: 'emailOTPValidatedAction'
    },
    // ************************************************  Email OTP Channels End  ****************************************
};