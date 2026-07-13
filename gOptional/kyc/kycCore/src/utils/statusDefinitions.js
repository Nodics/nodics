/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_KYC_00000: {
        code: '200',
        message: 'Request successfully processed'
    },
    SUC_KYC_00001: {
        code: '200',
        message: 'OTP has been sent successfully'
    },
    SUC_KYC_00002: {
        code: '200',
        message: 'KYC has been validated successfully'
    },
    SUC_KYC_00003: {
        code: '200',
        message: 'Token been notified to user successfully'
    },


    ERR_KYC_00000: {
        code: '500',
        message: 'Facing internal server error'
    },
    ERR_KYC_00001: {
        code: '500',
        message: 'KYC process not yet initiated'
    },
    ERR_KYC_00002: {
        code: '500',
        message: 'Undefined KYC type'
    }
};