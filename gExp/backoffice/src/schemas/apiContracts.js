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
const moduleAvailability = {
    type: 'object', additionalProperties: false,
    required: ['state', 'activeInstances', 'healthyInstances', 'unavailableInstances', 'unknownInstances'],
    properties: {
        state: { enum: ['UP', 'DEGRADED', 'UNAVAILABLE', 'UNKNOWN'] },
        activeInstances: { type: 'integer', minimum: 0 }, healthyInstances: { type: 'integer', minimum: 0 },
        unavailableInstances: { type: 'integer', minimum: 0 }, unknownInstances: { type: 'integer', minimum: 0 }
    }
};
const contractDecision = {
    type: 'object', additionalProperties: false, required: ['reason', 'expectedRevision'], properties: {
        reason: { type: 'string', minLength: 1, maxLength: 1024 }, expectedRevision: { type: 'integer', minimum: 0 }
    }
};
const contractHistorySnapshot = {
    type: 'object', additionalProperties: false,
    required: ['moduleName', 'contractType', 'contractVersion', 'contractHash', 'operations', 'schemas', 'state', 'changeClassification', 'revision', 'discoveredAt'],
    properties: {
        moduleName: moduleName, contractType: { enum: ['OPENAPI'] }, contractVersion: { type: 'integer', minimum: 1 },
        contractHash: { type: 'string', pattern: '^[a-f0-9]{64}$' }, operations: { type: 'array', items: capabilityOperation },
        schemas: { type: 'array', uniqueItems: true, items: { type: 'string' } },
        state: { enum: ['DISCOVERED', 'ACTIVE', 'PENDING_APPROVAL', 'REJECTED', 'SUPERSEDED'] },
        changeClassification: { enum: ['INITIAL', 'UNCHANGED', 'NON_BREAKING', 'POTENTIALLY_BREAKING', 'BREAKING'] },
        revision: { type: 'integer', minimum: 0 }, activationRevision: { type: 'integer', minimum: 1 },
        discoveredAt: { type: 'string', format: 'date-time' }, decidedAt: { type: 'string', format: 'date-time' },
        decidedBy: { type: 'string' }, decisionReason: { type: 'string', maxLength: 1024 }
    }
};
const contractActivation = {
    type: 'object', required: ['moduleName', 'activeHash', 'revision'], properties: {
        moduleName: moduleName, activeHash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
        previousHash: { type: 'string', pattern: '^[a-f0-9]{64}$' }, revision: { type: 'integer', minimum: 1 }
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
        clientCallable: { type: 'boolean' }, endpoint: { type: 'string' },
        healthPath: { type: 'string', maxLength: 512, pattern: '^/(?!/)' },
        leaseTtlMs: { type: 'integer', minimum: 1000 }, runtime: { type: 'object', additionalProperties: false, properties: {
            router: { type: 'boolean' }, publish: { type: 'boolean' }, web: { type: 'boolean' }
        } }, backoffice: backofficeMetadata
    }
};
const moduleLease = {
    type: 'object', required: ['moduleName', 'instanceId', 'state', 'lastSeenAt'],
    properties: {
        moduleName: moduleName, instanceId: { type: 'string' }, environment: { type: 'string' }, server: { type: 'string' },
        node: { type: 'string', nullable: true }, version: { type: 'string' }, moduleKind: { type: 'string' },
        capabilities: { type: 'array', items: { type: 'string' } }, clientCallable: { type: 'boolean' },
        endpoint: { type: 'string' }, healthPath: { type: 'string' },
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
    moduleAvailability: moduleAvailability,
    adminListData: { type: 'object', required: ['total', 'offset', 'limit', 'items'], properties: {
        total: { type: 'integer', minimum: 0 }, offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: 100 },
        items: { type: 'array', items: { type: 'object', required: ['moduleName', 'capabilities', 'availability', 'compatibility', 'activeInstances'], properties: {
            moduleName: moduleName, version: { type: 'string' }, moduleKind: { type: 'string' }, capabilities: { type: 'array', items: { type: 'string' } },
            environments: { type: 'array', items: { type: 'string' } }, servers: { type: 'array', items: { type: 'string' } },
            availability: moduleAvailability, compatibility: { type: 'object' }, activeInstances: { type: 'integer', minimum: 0 }
        } } }
    } },
    adminDetailData: { type: 'object', required: ['moduleName', 'instances'], properties: {
        moduleName: moduleName, availability: moduleAvailability, instances: { type: 'array', items: moduleLease }
    } },
    refreshData: { type: 'object', required: ['moduleName', 'refreshedInstances', 'discoveryRequested'], properties: {
        moduleName: moduleName, refreshedInstances: { type: 'integer', minimum: 0 }, discoveryRequested: { type: 'boolean' }
    } },
    contractDecision: contractDecision,
    contractHistorySnapshot: contractHistorySnapshot,
    contractActivation: contractActivation,
    contractCurrentData: { type: 'object', required: ['snapshot'], properties: {
        snapshot: Object.assign({}, contractHistorySnapshot, { nullable: true })
    } },
    contractHistoryData: { type: 'object', required: ['moduleName', 'snapshots'], properties: {
        moduleName: moduleName, snapshots: { type: 'array', items: contractHistorySnapshot }
    } },
    contractComparisonData: { type: 'object', required: ['moduleName', 'activeHash', 'candidateHash', 'changeClassification', 'addedOperations', 'removedOperations'], properties: {
        moduleName: moduleName, activeHash: { type: 'string', nullable: true, pattern: '^[a-f0-9]{64}$' },
        candidateHash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
        changeClassification: { enum: ['INITIAL', 'UNCHANGED', 'NON_BREAKING', 'POTENTIALLY_BREAKING', 'BREAKING'] },
        addedOperations: { type: 'array', items: { type: 'string' } }, removedOperations: { type: 'array', items: { type: 'string' } }
    } },
    contractDecisionData: { type: 'object', required: ['snapshot'], properties: {
        snapshot: contractHistorySnapshot, activation: contractActivation
    } },
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
        availability: { type: 'object', additionalProperties: moduleAvailability }, uiComposition: uiCompositionSelection
    } },
    diagnosticsData: { type: 'object', required: ['activeModuleLeases', 'metrics', 'store'], properties: {
        activeModuleLeases: { type: 'integer', minimum: 0 }, metrics: { type: 'object' }, store: { type: 'object' },
        discovery: { type: 'object' }, availability: { type: 'object', properties: {
            trackedInstances: { type: 'integer', minimum: 0 }, trackedModules: { type: 'integer', minimum: 0 },
            inflight: { type: 'integer', minimum: 0 }, queued: { type: 'integer', minimum: 0 },
            activeObservations: { type: 'integer', minimum: 0 }, inflightTransitions: { type: 'integer', minimum: 0 },
            metrics: { type: 'object', properties: {
                attempts: { type: 'integer', minimum: 0 }, successes: { type: 'integer', minimum: 0 },
                failures: { type: 'integer', minimum: 0 }, readinessFailures: { type: 'integer', minimum: 0 },
                transportFailures: { type: 'integer', minimum: 0 }, timeouts: { type: 'integer', minimum: 0 },
                staleReads: { type: 'integer', minimum: 0 }, suppressedRefreshes: { type: 'integer', minimum: 0 },
                inflightDeduplications: { type: 'integer', minimum: 0 }, queued: { type: 'integer', minimum: 0 },
                queueRejected: { type: 'integer', minimum: 0 }, maxConcurrentObserved: { type: 'integer', minimum: 0 },
                transitions: { type: 'integer', minimum: 0 },
                publicationAttempts: { type: 'integer', minimum: 0 }, publicationSuccesses: { type: 'integer', minimum: 0 },
                publicationFailures: { type: 'integer', minimum: 0 }, totalDurationMs: { type: 'integer', minimum: 0 },
                maxDurationMs: { type: 'integer', minimum: 0 }, lastDurationMs: { type: 'integer', minimum: 0 }
            } }
        } }, security: { type: 'object' }, operations: { type: 'object', properties: {
            state: { enum: ['READY', 'DEGRADED', 'NOT_READY'] }, alerts: { type: 'array', items: { type: 'string' } },
            checkedAt: { type: 'string', format: 'date-time' }
        } }, contracts: { type: 'object', properties: {
            persistenceStatus: { enum: ['AVAILABLE', 'UNAVAILABLE', 'AUTH_CONTEXT_REQUIRED'] },
            pendingApprovals: { type: 'integer', nullable: true, minimum: 0 },
            activeSelections: { type: 'integer', nullable: true, minimum: 0 },
            countsCappedAt: { type: 'integer', minimum: 1 }, lastFailureCode: { type: 'string' }, metrics: { type: 'object' }
        } }
    } }
};
