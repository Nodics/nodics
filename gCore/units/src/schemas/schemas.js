/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/src/schemas/schemas
 * @description Schema definition registry for this boundary.
 * @layer definition
 * @owner generated
 * @override Later active modules may extend or replace this registry through Nodics layering.
 */
module.exports = {
    units: {
        unitDimension: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                dimensionCode: { type: 'string', required: true }, name: { type: 'string', required: true },
                status: { type: 'string', required: true, default: 'DRAFT' },
                scopeType: { type: 'string', required: true, default: 'GLOBAL' }, enterpriseCode: { type: 'string', required: false },
                dimensionVector: { type: 'object', required: true, description: 'Base-dimension exponent map for compatibility and compound units' }
            }, indexes: { common: { scopeType: { enabled: true, name: 'scopeType' }, enterpriseCode: { enabled: true, name: 'enterpriseCode' } },
                individual: { dimensionCode: { enabled: true, name: 'dimensionCode', options: { unique: true } }, status: { enabled: true, name: 'status' } } }
        },
        unitOfMeasure: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                unitCode: { type: 'string', required: true }, name: { type: 'string', required: true }, symbol: { type: 'string', required: false },
                dimensionCode: { type: 'string', required: true }, dimensionVector: { type: 'object', required: true },
                kind: { type: 'string', required: true, default: 'LINEAR' }, baseUnit: { type: 'bool', required: true, default: false },
                components: { type: 'array', required: false, default: [], description: 'Derived-unit component codes and integer exponents' },
                precisionScale: { type: 'int', required: true, default: 6 }, roundingMode: { type: 'string', required: true, default: 'HALF_EVEN' },
                status: { type: 'string', required: true, default: 'DRAFT' }, scopeType: { type: 'string', required: true, default: 'GLOBAL' },
                enterpriseCode: { type: 'string', required: false }, aliases: { type: 'array', required: false, default: [] }
            }, indexes: { common: { scopeType: { enabled: true, name: 'scopeType' }, enterpriseCode: { enabled: true, name: 'enterpriseCode' } },
                individual: { unitCode: { enabled: true, name: 'unitCode', options: { unique: true } },
                    dimensionCode: { enabled: true, name: 'dimensionCode' }, status: { enabled: true, name: 'status' } } }
        },
        unitConversion: {
            super: 'base', model: true, service: { enabled: true }, router: { enabled: false }, event: { enabled: false },
            definition: {
                conversionCode: { type: 'string', required: true }, fromUnitCode: { type: 'string', required: true }, toUnitCode: { type: 'string', required: true },
                numerator: { type: 'string', required: true, description: 'Positive exact integer numerator' },
                denominator: { type: 'string', required: true, description: 'Positive exact integer denominator' },
                geographicScopeLevel: { type: 'string', required: true, default: 'GLOBAL' }, countryCode: { type: 'string', required: false },
                subdivisionCode: { type: 'string', required: false }, localityCode: { type: 'string', required: false },
                status: { type: 'string', required: true, default: 'DRAFT' }, scopeType: { type: 'string', required: true, default: 'GLOBAL' },
                enterpriseCode: { type: 'string', required: false }, effectiveFrom: { type: 'date', required: false }, effectiveTo: { type: 'date', required: false }
            }, indexes: { common: { scopeType: { enabled: true, name: 'scopeType' }, enterpriseCode: { enabled: true, name: 'enterpriseCode' },
                fromUnitCode: { enabled: true, name: 'fromUnitCode' }, toUnitCode: { enabled: true, name: 'toUnitCode' } }, individual: {
                conversionCode: { enabled: true, name: 'conversionCode', options: { unique: true } },
                geographicScopeLevel: { enabled: true, name: 'geographicScopeLevel' }, status: { enabled: true, name: 'status' } } }
        }
    }
};
