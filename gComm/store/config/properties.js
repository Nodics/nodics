/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module store/config/properties
 * @description Defines generated configurable defaults for store.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    backofficeCapabilities: {
        store: {
            enabled: true, capabilityId: 'store-management', displayName: 'Stores', category: 'commerce', icon: 'store',
            contractVersion: 1, minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['store.backoffice.read'],
            navigation: [{ id: 'stores', label: 'Stores', route: '/commerce/stores', order: 410 }]
        }
    },
    store: {
        enterpriseScope: { required: true },
        identity: { separator: '::', maxCodeLength: 128, codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' },
        store: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            types: ['PHYSICAL', 'ONLINE', 'HYBRID', 'DARK_STORE', 'PICKUP_POINT'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        warehouseAssignment: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            purposes: ['FULFILLMENT', 'PICKUP', 'RETURNS', 'REPLENISHMENT'],
            minimumPriority: 0,
            maximumPriority: 999999,
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        warehouseReference: {
            moduleName: 'inventory',
            apiVersion: 'v0',
            apiName: '/references/warehouses/resolve',
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            preferLocal: true
        },
        management: {
            maximumResultCount: 500,
            maximumPayloadBytes: 262144,
            allowedResources: ['stores', 'warehouseAssignments']
        },
        referenceLookup: { requireServiceToken: true, maximumResultCount: 1 }
    }
};
