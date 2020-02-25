/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {
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
    }
};