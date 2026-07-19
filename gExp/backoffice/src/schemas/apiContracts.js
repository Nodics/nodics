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
const moduleRole = { enum: ['AUTHENTICATION_PROVIDER', 'CONTROL_PLANE_PROVIDER', 'UI_COMPOSITION_PROVIDER',
    'FUNCTIONAL_CAPABILITY_PROVIDER', 'MONITORING_PROVIDER'] };
const uiComposition = {
    type: 'object', additionalProperties: false, required: ['site', 'catalog', 'defaultPage', 'fallbackMode'],
    properties: {
        site: { type: 'string' }, catalog: { type: 'string' }, defaultPage: { type: 'string' },
        fallbackMode: { enum: ['STATIC_RECOVERY_SHELL'] }
    }
};
const discovery = {
    type: 'object', additionalProperties: false,
    properties: {
        openApiPath: { type: 'string' }, contractVersion: { type: 'integer', minimum: 1 }
    }
};
const capabilityOperation = {
    type: 'object', additionalProperties: false, required: ['operationId', 'path', 'method', 'permissions'],
    properties: {
        operationId: { type: 'string' }, path: { type: 'string' }, method: { enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] },
        schemaName: { type: 'string' }, operation: { type: 'string' },
        permissions: { type: 'array', uniqueItems: true, items: { type: 'string' } }
    }
};
const capabilitySnapshot = {
    type: 'object', additionalProperties: false,
    required: ['moduleName', 'contractType', 'contractVersion', 'operations', 'schemas', 'hash', 'discoveredAt', 'changeClassification'],
    properties: {
        moduleName: moduleName, contractType: { enum: ['OPENAPI'] }, contractVersion: { type: 'integer', minimum: 1 },
        operations: { type: 'array', items: capabilityOperation }, schemas: { type: 'array', uniqueItems: true, items: { type: 'string' } },
        hash: { type: 'string', pattern: '^[a-f0-9]{64}$' }, discoveredAt: { type: 'string', format: 'date-time' },
        changeClassification: { enum: ['INITIAL', 'UNCHANGED', 'NON_BREAKING', 'POTENTIALLY_BREAKING', 'BREAKING'] },
        latestChangeClassification: { enum: ['INITIAL', 'UNCHANGED', 'NON_BREAKING', 'POTENTIALLY_BREAKING', 'BREAKING'] },
        candidateHash: { type: 'string', pattern: '^[a-f0-9]{64}$' }
    }
};
const uiCompositionSelection = {
    type: 'object', required: ['enabled', 'fallbackMode'], properties: {
        enabled: { type: 'boolean' }, providerModule: moduleName, site: { type: 'string' }, catalog: { type: 'string' },
        defaultPage: { type: 'string' }, fallbackMode: { enum: ['STATIC_RECOVERY_SHELL'] }
    }
};
const backofficeMetadata = {
    type: 'object', additionalProperties: false,
    properties: {
        enabled: { type: 'boolean' }, capabilityId: { type: 'string' }, displayName: { type: 'string' },
        category: { type: 'string' }, icon: { type: 'string' }, contractVersion: { type: 'integer', minimum: 1 },
        minimumClientContractVersion: { type: 'integer', minimum: 1 },
        roles: { type: 'array', uniqueItems: true, items: moduleRole }, discovery: discovery,
        uiComposition: uiComposition,
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
    moduleRole: moduleRole,
    uiComposition: uiComposition,
    discovery: discovery,
    capabilityOperation: capabilityOperation,
    capabilitySnapshot: capabilitySnapshot,
    uiCompositionSelection: uiCompositionSelection,
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
    bootstrapData: { type: 'object', required: ['compatibility', 'modules', 'catalogue', 'availability', 'uiComposition'], properties: {
        compatibility: { type: 'object' }, modules: { type: 'object' }, catalogue: { type: 'object' },
        availability: { type: 'object' }, uiComposition: uiCompositionSelection
    } },
    diagnosticsData: { type: 'object', required: ['activeModuleLeases', 'metrics', 'store'], properties: {
        activeModuleLeases: { type: 'integer', minimum: 0 }, metrics: { type: 'object' }, store: { type: 'object' }
    } }
};
