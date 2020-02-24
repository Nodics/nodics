/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    SUC_JOB_00000: {
        code: '200',
        message: 'Job successfully processed'
    },
    SUC_JOB_00001: {
        code: '200',
        message: 'Job partially processed'
    },
    SUC_JOB_00002: {
        code: '200',
        message: 'Jobs removed successfully'
    },

    ERR_JOB_00000: {
        code: '500',
        message: 'Job internal server error'
    },
    ERR_JOB_00001: {
        code: '501',
        message: 'Job not implemented'
    },
    ERR_JOB_00002: {
        code: '503',
        message: 'Job unavailable currently'
    },
    ERR_JOB_00003: {
        code: '400',
        message: 'Invalid job request'
    },
    ERR_JOB_00004: {
        code: '404',
        message: 'Job not found'
    }
};