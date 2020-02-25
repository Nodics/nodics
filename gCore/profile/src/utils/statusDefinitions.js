/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_PRFL_00000: {
        code: '200',
        message: 'Request successfully processed'
    },
    SUC_PRFL_00001: {
        code: '200',
        message: 'Request partially processed'
    },


    ERR_PRFL_00000: {
        code: '500',
        message: 'Facing internal server error'
    },
    ERR_PRFL_00001: {
        code: '501',
        message: 'Operation not implemented'
    },
    ERR_PRFL_00002: {
        code: '503',
        message: 'Operation unavailable currently'
    },
    ERR_PRFL_00003: {
        code: '400',
        message: 'Invalid request parameters'
    },
    ERR_PRFL_00004: {
        code: '404',
        message: 'Data not found'
    }
};