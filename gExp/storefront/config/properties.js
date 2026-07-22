/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module storefront/config/properties
 * @description Defines generated configurable defaults for storefront.
 * @layer config
 * @owner generated
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    backofficeCapabilities: {
        storefront: {
            enabled: true,
            capabilityId: 'storefront-management',
            displayName: 'Storefronts',
            category: 'experience',
            icon: 'storefront',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['UI_COMPOSITION_PROVIDER', 'FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['storefront.backoffice.read'],
            navigation: [{ id: 'storefronts', label: 'Storefronts', route: '/experience/storefronts', order: 300 }]
        }
    },
    storefront: {
        enterpriseScope: { required: true },
        identity: { separator: '::', maxCodeLength: 128, codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' },
        lifecycle: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: {
                DRAFT: ['ACTIVE', 'RETIRED'],
                ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'],
                RETIRED: []
            }
        },
        endpointLifecycle: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: {
                DRAFT: ['ACTIVE', 'RETIRED'],
                ACTIVE: ['SUSPENDED', 'RETIRED'],
                SUSPENDED: ['ACTIVE', 'RETIRED'],
                RETIRED: []
            }
        },
        limits: { maximumStores: 100, maximumContextValues: 100, maximumPayloadBytes: 262144, maximumResultCount: 500 },
        host: { maximumLength: 253, allowedSchemes: ['https'], trustForwardedHost: false },
        cmsSiteReference: {
            moduleName: 'cms',
            apiVersion: 'v0',
            apiName: '/references/sites/resolve',
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            preferLocal: true
        },
        storeReference: {
            moduleName: 'store',
            apiVersion: 'v0',
            apiName: '/references/stores/resolve',
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            preferLocal: true
        },
        catalogReference: { maximumResults: 2 },
        management: { allowedResources: ['storefronts', 'endpoints'] },
        contextResolution: { defaultTenant: 'default', validateLiveReferences: true }
    }
};
