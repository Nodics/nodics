/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module backoffice/schemas/ApiContracts
 * @description Defines provider-neutral JSON API schemas for registration, discovery, bootstrap, compatibility, and diagnostics.
 * @layer schema
 * @owner backoffice
 * @override Later modules may replace these schemas while preserving field meaning, security boundaries, and contract versions.
 */
const moduleName = { type: 'string', pattern: '^[A-Za-z][A-Za-z0-9_-]{0,127}$' };
const backofficeMetadata = {
    type: 'object', additionalProperties: false,
    properties: {
        enabled: { type: 'boolean' }, capabilityId: { type: 'string' }, displayName: { type: 'string' },
        category: { type: 'string' }, icon: { type: 'string' }, contractVersion: { type: 'integer', minimum: 1 },
        minimumClientContractVersion: { type: 'integer', minimum: 1 },
        requiredPermissions: { type: 'array', uniqueItems: true, items: { type: 'string' } },
        navigation: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'label'], properties: {
            id: { type: 'string' }, label: { type: 'string' }, route: { type: 'string' }, order: { type: 'integer' },
            requiredPermissions: { type: 'array', uniqueItems: true, items: { type: 'string' } }
        } } }
    }
};
const registration = {
    type: 'object', additionalProperties: false, required: ['moduleName', 'instanceId', 'clientCallable'],
    properties: {
        moduleName: moduleName, instanceId: { type: 'string', minLength: 1 }, version: { type: 'string' },
        moduleKind: { type: 'string' }, capabilities: { type: 'array', uniqueItems: true, items: { type: 'string' } },
        clientCallable: { type: 'boolean' }, endpoint: { type: 'string' }, healthPath: { type: 'string' },
        leaseTtlMs: { type: 'integer', minimum: 1000 }, runtime: { type: 'object', additionalProperties: false, properties: {
            router: { type: 'boolean' }, publish: { type: 'boolean' }, web: { type: 'boolean' }
        } }, backoffice: backofficeMetadata
    }
};
const moduleLease = {
    type: 'object', required: ['moduleName', 'instanceId', 'state', 'lastSeenAt'],
    properties: {
        moduleName: moduleName, instanceId: { type: 'string' }, version: { type: 'string' }, moduleKind: { type: 'string' },
        capabilities: { type: 'array', items: { type: 'string' } }, endpoint: { type: 'string' }, healthPath: { type: 'string' },
        state: { enum: ['UP'] }, lastSeenAt: { type: 'string', format: 'date-time' }, backoffice: backofficeMetadata
    }
};

module.exports = {
    moduleName: moduleName,
    backofficeMetadata: backofficeMetadata,
    registration: registration,
    registrationBatch: {
        type: 'object', additionalProperties: false, required: ['instanceId', 'registrations'],
        properties: {
            instanceId: { type: 'string', minLength: 1 }, environment: { type: 'string' }, server: { type: 'string' },
            node: { type: 'string', nullable: true }, registrations: { type: 'array', minItems: 1, items: registration }
        }
    },
    moduleLease: moduleLease,
    discoveryData: { type: 'object', required: ['modules'], properties: {
        modules: { type: 'object', additionalProperties: { type: 'array', items: moduleLease } }
    } },
    compatibility: { type: 'object', required: ['clientContractVersion', 'status'], properties: {
        clientContractVersion: { type: 'integer', minimum: 1 }, moduleContractVersion: { type: 'integer', minimum: 1 },
        minimumClientContractVersion: { type: 'integer', minimum: 1 }, status: { enum: ['COMPATIBLE', 'DEGRADED', 'INCOMPATIBLE'] }
    } },
    bootstrapData: { type: 'object', required: ['compatibility', 'modules', 'catalogue', 'availability'], properties: {
        compatibility: { type: 'object' }, modules: { type: 'object' }, catalogue: { type: 'object' }, availability: { type: 'object' }
    } },
    diagnosticsData: { type: 'object', required: ['activeModuleLeases', 'metrics', 'store'], properties: {
        activeModuleLeases: { type: 'integer', minimum: 0 }, metrics: { type: 'object' }, store: { type: 'object' }
    } }
};
