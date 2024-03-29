/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    /**
     * Exception codes related to Database operations
     */
    SUC_OTP_00000: {
        code: '200',
        message: 'Operation successfully processed: OTP generated'
    },
    SUC_OTP_00001: {
        code: '200',
        message: 'Successfully validated OTP'
    },

    ERR_OTP_00000: {
        code: '500',
        message: 'Internal server error while generating OTP'
    },

    ERR_OTP_00001: {
        code: '500',
        message: 'OTP expired'
    },

    ERR_OTP_00002: {
        code: '500',
        message: 'OTP data is not valid'
    },

    ERR_OTP_00003: {
        code: '500',
        message: 'Invalid request, please validate'
    }
};