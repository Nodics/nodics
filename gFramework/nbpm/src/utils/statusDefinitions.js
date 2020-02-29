/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_WF_00000: {
        code: '200',
        message: 'Request successfully processed'
    },
    SUC_WF_00001: {
        code: '200',
        message: 'Request partially processed'
    },

    ERR_WF_00000: {
        code: '500',
        message: 'Application internal server error'
    },
    ERR_WF_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_WF_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_WF_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_WF_00004: {
        code: '404',
        message: 'operation not found'
    },
    ERR_WF_00005: {
        code: '404',
        message: 'Failed executing interceptors or validators'
    },
    ERR_WF_00006: {
        code: '404',
        message: 'Failed executing post interceptors or validators'
    },
    ERR_WF_00007: {
        code: '404',
        message: 'Failed executing channel qualifier handler'
    },
    ERR_WF_00008: {
        code: '404',
        message: 'Failed executing channel qualifier script'
    },
    ERR_WF_00009: {
        code: '404',
        message: 'Invalid channel definition'
    },
    ERR_WF_00010: {
        code: '200',
        message: 'No data found'
    }
};