/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2017 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the 
    terms of the license agreement you entered into with Nodics.

 */

module.exports = {

    // SUCCESS STATUS Cache
    SUC_CACHE_00000: {
        code: '200000',
        description: 'Successfully processed',
        message: 'Successfully processed'
    },

    SUC_CACHE_00001: {
        code: '200000',
        description: 'None schema found for module',
        message: 'None schema found for module'
    },


    //ERROR STATUS Cache
    ERR_CACHE_00000: {
        code: '200000',
        description: 'Facing some issues, please try after some time',
        message: 'Facing some issues, please try after some time'
    },

    ERR_CACHE_00001: {
        code: '200001',
        description: 'Could not found item in cache',
        message: 'Could not found item in cache'
    },

    ERR_CACHE_00002: {
        code: '200002',
        description: 'Auth cache initialization failed',
        message: 'Auth cache initialization failed'
    },

    ERR_CACHE_00003: {
        code: '200003',
        description: 'Model cache initialization failed',
        message: 'Model cache initialization failed'
    },

    ERR_CACHE_00004: {
        code: '200004',
        description: 'Router cache initialization failed',
        message: 'Router cache initialization failed'
    },

    ERR_CACHE_00005: {
        code: '200005',
        description: 'Please validate your request, looks no configuration contain',
        message: 'Please validate your request, looks no configuration contain'
    },

    ERR_CACHE_00006: {
        code: '200006',
        description: 'Invalid routerName property to update router cache',
        message: 'Invalid routerName property to update router cache'
    },

    ERR_CACHE_00007: {
        code: '200007',
        description: 'Could not found router definition',
        message: 'Could not found router definition'
    },

    ERR_CACHE_00008: {
        code: '200008',
        description: 'Invalid schemaName to update item cache',
        message: 'Invalid schemaName to update item cache'
    },

    ERR_CACHE_00009: {
        code: '200009',
        description: 'Invalid module or cache configuration',
        message: 'Invalid module or cache configuration'
    },

    ERR_CACHE_00010: {
        code: '170010',
        description: 'Cache client has not been configured for this module',
        message: 'Cache client has not been configured for this module'
    },
};