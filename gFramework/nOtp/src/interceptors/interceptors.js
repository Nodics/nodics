/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    otpPreGet: {
        type: 'schema',
        item: 'otp',
        trigger: 'preGet',
        active: 'true',
        index: 0,
        handler: 'DefaultOtpValidityCheckInterceptorService.fetchValidOtp'
    },
    // otpPostGet: {
    //     type: 'schema',
    //     item: 'otp',
    //     trigger: 'postGet',
    //     active: 'true',
    //     index: 0,
    //     handler: 'DefaultOtpValidityCheckInterceptorService.checkOtpValidity'
    // },
    // otpPostSave: {
    //     type: 'schema',
    //     item: 'otp',
    //     trigger: 'postSave',
    //     active: 'true',
    //     index: 0,
    //     handler: 'DefaultOtpValidityCheckInterceptorService.updateCache'
    // },
};