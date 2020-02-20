/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
    SUC_SYS_00000: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_SYS_00000: {
        code: '500',
        message: 'Failed due to some internal error',
    },

    // HELP router level status codes

    SUC_HLP_00000: {
        code: '200',
        message: 'Help notation successfully provided',
    },

    ERR_HLP_00000: {
        code: '500',
        message: 'Failed to serve help notation',
    },

    // Model level status codes
    ERR_MDL_00000: {
        code: '400',
        message: 'Internal model error',
    },
    ERR_MDL_00001: {
        code: '400',
        message: 'Invalid model object',
    },
    ERR_MDL_00002: {
        code: '400',
        message: 'Failed to update doc, Please check your modelSaveOptions',
    },
    ERR_MDL_00003: {
        code: '400',
        message: 'Invalid query object',
    },
    ERR_MDL_00004: {
        code: '400',
        message: 'Invalid version id',
    },

    // Authentication Status configuration 

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

    // Login related status codes
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

    // GET request process status

    SUC_FIND_00000: {
        code: '200',
        message: 'Successfully processed',
    },

    ERR_FIND_00000: {
        code: '100000',
        message: 'Facing some issues, Please try after some time',
    },

    ERR_FIND_00001: {
        code: '400',
        message: 'Invalid request parameters'
    },

    ERR_FIND_00002: {
        code: '100003',
        description: 'Could not populate nested documents',
        message: 'Could not populate nested documents'
    },

    ERR_FIND_00003: {
        code: '100004',
        description: 'Could not execute pre interceptors',
        message: 'Could not execute pre interceptors'
    },
    ERR_FIND_00004: {
        code: '100005',
        description: 'Could not execute post interceptors',
        message: 'Could not execute post interceptors'
    },

    ERR_FIND_00005: {
        code: '100006',
        description: 'Please validate your request, looks not valid',
        message: 'Please validate your request, looks not valid'
    },

    // Cache status codes

    SUC_CACHE_00000: {
        code: '200',
        message: 'Successfully processed'
    },
    SUC_CACHE_00001: {
        code: '200',
        message: 'None schema found for module'
    },
    SUC_CACHE_00002: {
        code: '200',
        message: 'Successfully fulfilled from router cache'
    },

    ERR_CACHE_00000: {
        code: '400',
        message: 'Facing internal application error'
    },

    ERR_CACHE_00001: {
        code: '404',
        message: 'Could not found item in cache'
    },

    ERR_CACHE_00002: {
        code: '400',
        message: 'Please validate your request, looks no configuration contain'
    },

    ERR_CACHE_00003: {
        code: '400',
        message: 'Invalid routerName property to update router cache'
    },
    ERR_CACHE_00004: {
        code: '400',
        message: 'Invalid schemaName property to update item cache'
    },

    ERR_CACHE_00005: {
        code: '404',
        message: 'Could not found router definition'
    },

    ERR_CACHE_00006: {
        code: '400',
        message: 'Cache client has not been configured for this module'
    },
};