/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/src/router/routers
 * @description Router definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    units: {
        referenceConversion: {
            convert: {
                secured: true,
                accessGroups: ['userGroup'],
                permissionConfig: 'authSecurity.internalToken.routePermission',
                apiExposure: 'moduleInternal',
                key: '/references/units/convert',
                method: 'POST',
                controller: 'DefaultUnitsReferenceController',
                operation: 'convert',
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object',
                    required: ['quantity', 'fromUnitCode', 'toUnitCode', 'targetScale'], additionalProperties: false,
                    properties: {
                        quantity: { type: 'string', minLength: 1, maxLength: 256 },
                        fromUnitCode: { type: 'string', minLength: 1, maxLength: 128 },
                        toUnitCode: { type: 'string', minLength: 1, maxLength: 128 },
                        targetScale: { type: 'integer', minimum: 0, maximum: 18 },
                        roundingMode: { type: 'string' },
                        geography: { type: 'object', additionalProperties: false, properties: {
                            countryCode: { type: 'string' }, subdivisionCode: { type: 'string' }, localityCode: { type: 'string' }
                        } },
                        at: { type: 'string', format: 'date-time' }
                    }
                } } } },
                responses: { '200': { description: 'Exact Units-owned conversion projection' } }
            }
        }
    }
};
