/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/src/utils/statusDefinitions
 * @description Status and error definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    SUC_UNIT_00001: { code: '200', message: 'Units conversion completed' },
    ERR_UNIT_00001: { code: '400', message: 'Invalid exact decimal value or precision policy' },
    ERR_UNIT_00002: { code: '400', message: 'Invalid units dimension or unit definition' },
    ERR_UNIT_00003: { code: '400', message: 'Units are dimensionally incompatible' },
    ERR_UNIT_00004: { code: '400', message: 'Invalid or ambiguous geographic conversion scope' },
    ERR_UNIT_00005: { code: '404', message: 'Active units conversion was not found' },
    ERR_UNIT_00006: { code: '409', message: 'Units identity or lifecycle change is not allowed' },
    ERR_UNIT_00007: { code: '403', message: 'Units reference conversion requires an internal service identity' }
};
