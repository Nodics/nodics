/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module nRouter/utils/statusDefinitions
 * @description Status and error definitions for router help, route governance, and override validation.
 * @layer data
 * @owner nRouter
 * @override Project modules may contribute additional router status definitions or localized messages through later modules.
 */
module.exports = {
    SUC_HLP_00000: {
        code: '200',
        message: 'Help notation successfully provided',
    },

    ERR_HLP_00000: {
        code: '500',
        message: 'Failed to serve help notation',
    },

    ERR_RTR_00003: {
        code: '400',
        message: 'Invalid router override definition',
    }
};
