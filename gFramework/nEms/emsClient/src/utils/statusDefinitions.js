/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_EMS_00000: {
        code: '200',
        message: 'Successfully processed'
    },

    ERR_EMS_00000: {
        code: '400',
        message: 'Failed due to internal error'
    },
    ERR_EMS_00001: {
        code: '400',
        message: 'Failed to publish message'
    },
    ERR_EMS_00002: {
        code: '400',
        message: 'Invalid or null payload'
    },
    ERR_EMS_00003: {
        code: '503',
        message: 'Not able to establish connection',
    },
    ERR_EMS_00004: {
        code: '400',
        message: 'Invalid configuration',
    },
    ERR_EMS_00005: {
        code: '500',
        message: 'Failed converting message from XML to JSON'
    }
};