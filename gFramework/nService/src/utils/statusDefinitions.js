/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    SUC_TNT_00000: {
        code: '200',
        message: 'Operation successfully processed'
    },
    SUC_TNT_00001: {
        code: '200',
        message: 'Operation partially processed'
    },

    ERR_TNT_00000: {
        code: '500',
        message: 'Operation internal server error'
    },
    ERR_TNT_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_TNT_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_TNT_00003: {
        code: '400',
        message: 'Invalid operation request'
    },
    ERR_TNT_00004: {
        code: '404',
        message: 'Operation not found'
    },
    ERR_TNT_00005: {
        code: '403',
        message: 'Operation not allowed'
    },
};