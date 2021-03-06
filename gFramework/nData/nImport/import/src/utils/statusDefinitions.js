/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_IMP_00000: {
        code: '200',
        message: 'Data successfully processed'
    },
    SUC_IMP_00001: {
        code: '200',
        message: 'Data partially processed'
    },

    ERR_IMP_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_IMP_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_IMP_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_IMP_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_IMP_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_IMP_00005: {
        code: '500',
        message: 'Could not execute pre interceptors or validators'
    },
    ERR_IMP_00006: {
        code: '500',
        message: 'Could not execute post interceptors or validators'
    },
    ERR_IMP_00007: {
        code: '400',
        message: 'Models not found'
    }
};