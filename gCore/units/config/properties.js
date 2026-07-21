/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module units/config/properties
 * @description Defines generated configurable defaults for units.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    units: {
        identity: { separator: '::', maxCodeLength: 128, codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' },
        statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
        scopeTypes: ['GLOBAL', 'ENTERPRISE'],
        unitKinds: ['BASE', 'LINEAR', 'DERIVED'],
        roundingModes: ['UNNECESSARY', 'DOWN', 'UP', 'HALF_UP', 'HALF_EVEN'],
        maximumScale: 18,
        maximumConversionDigits: 128,
        referenceConversion: {
            requireServiceToken: true,
            maximumDefinitionResults: 20,
            multiHopEnabled: false,
            maximumHops: 4,
            maximumGraphConversions: 200
        },
        dimensions: ['COUNT', 'MASS', 'VOLUME', 'LENGTH', 'AREA', 'TIME', 'PERCENTAGE'],
        geographicScopeLevels: ['GLOBAL', 'COUNTRY', 'SUBDIVISION', 'LOCALITY'],
        allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'],
            SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
    }
};
