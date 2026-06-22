/**
 * @module nCache/cache/utils/StatusDefinitions
 * @description Defines stable success and error codes for cache operations, misses, configuration validation, client availability, and mutation-scope enforcement.
 * @layer status
 * @owner nCache/cache
 * @override Project modules may add status definitions while preserving existing codes and HTTP semantics for backward compatibility.
 */
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
    },
    ERR_CACHE_00007: {
        code: '403',
        message: 'Cache mutation scope does not match the authorized tenant and active module'
    },
    ERR_CACHE_00008: {
        code: '503',
        message: 'Selected cache adapter is unsupported and cannot be activated'
    },
    ERR_CACHE_00009: {
        code: '400',
        message: 'Cache adapter contract or TTL configuration is invalid'
    }
};
