/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nCommon/utils/statusDefinitions
 * @description Baseline platform success and error status definitions used when a capability-specific status is unavailable.
 * @layer utility
 * @owner nCommon
 * @override Later modules may contribute additional status codes or intentionally override definitions through the layered status catalog.
 */
module.exports = {
    SUC_SYS_00000: {
        code: '200',
        message: 'Successfully processed',
    },
    SUC_SYS_00001: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_SYS_00000: {
        code: '500',
        message: 'Failed due to some internal error',
    },
    ERR_SYS_00001: {
        code: '400',
        message: 'Failed due to validation error',
    },
    ERR_SYS_00002: {
        code: '503',
        message: 'Service not available',
    },

};
