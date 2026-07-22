/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_STOREFRONT_00001: { code: '200', message: 'Storefront operation completed' },
    ERR_STOREFRONT_00001: { code: '400', message: 'Authenticated enterprise context is required' },
    ERR_STOREFRONT_00002: { code: '403', message: 'Storefront enterprise or tenant scope mismatch' },
    ERR_STOREFRONT_00003: { code: '400', message: 'Storefront definition is invalid' },
    ERR_STOREFRONT_00004: { code: '409', message: 'Storefront lifecycle transition is invalid' },
    ERR_STOREFRONT_00005: { code: '400', message: 'Storefront reference is unavailable' },
    ERR_STOREFRONT_00006: { code: '409', message: 'Storefront identity is immutable' },
    ERR_STOREFRONT_00007: { code: '409', message: 'Storefront records must be retired instead of deleted' },
    ERR_STOREFRONT_00008: { code: '400', message: 'Storefront hostname is invalid' },
    ERR_STOREFRONT_00009: { code: '404', message: 'Active Storefront context was not found' },
    ERR_STOREFRONT_00010: {
        code: '409',
        message: 'Storefront endpoint or lifecycle dependency conflicts with the request'
    },
    ERR_STOREFRONT_00011: { code: '401', message: 'Storefront management requires a human principal' },
    ERR_STOREFRONT_00012: { code: '400', message: 'Storefront management request is invalid' },
    ERR_STOREFRONT_00013: { code: '413', message: 'Storefront request exceeds configured bounds' },
    ERR_STOREFRONT_00014: { code: '503', message: 'Storefront resolution capacity is temporarily unavailable' },
    ERR_STOREFRONT_00015: { code: '426', message: 'Storefront client contract version is no longer supported' },
    ERR_STOREFRONT_00016: { code: '503', message: 'Storefront context access is unavailable' },
    ERR_STOREFRONT_00017: { code: '400', message: 'Valid Storefront context binding is required' },
    ERR_STOREFRONT_00018: { code: '400', message: 'Active Storefront context handle is required' }
};
