/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    SUC_DATA_00000: {
        code: '200',
        message: 'Data successfully processed'
    },
    SUC_DATA_00001: {
        code: '200',
        message: 'Data partially processed'
    },

    ERR_DATA_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_DATA_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_DATA_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_DATA_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_DATA_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_DATA_00005: {
        code: '400',
        message: 'Data not found'
    },
    ERR_DATA_00006: {
        code: '400',
        message: 'Invalid header object'
    },
    ERR_DATA_00007: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_DATA_00008: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },
    ERR_DATA_00009: {
        code: '500',
        message: 'Could not execute pre/post processors'
    },
};