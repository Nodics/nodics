/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_AUTH_00000: {
        code: '200',
        message: 'Successfully authenticated',
    },
    SUC_AUTH_00001: {
        code: '200',
        message: 'Auth token generated successfully',
    },

    ERR_AUTH_00000: {
        code: '401',
        message: 'Authentication failed',
    },
    ERR_AUTH_00001: {
        code: '401',
        message: 'Invalid or expired authorization token',
    },
    ERR_AUTH_00002: {
        code: '400',
        message: 'Invalid authentication parameters'
    },

    ERR_LIN_00000: {
        code: '400',
        message: 'Invalid authentication parameters'
    },
    ERR_LIN_00002: {
        code: '401',
        message: 'Account is currently in locked state or has been disabled'
    },
    ERR_LIN_00003: {
        code: '400',
        message: 'Invalid authentication parameters'
    },

    ERR_ENT_00000: {
        code: '400',
        message: 'Invalid enterprise code'
    },
    ERR_ENT_00001: {
        code: '400',
        message: 'Invalid enterprise code'
    },

};