/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module pricing/config/properties @description Layered pricing policy and provider configuration. @layer configuration @owner pricing */
module.exports = {
    backofficeCapabilities: {
        pricing: {
            enabled: true, capabilityId: 'pricing-management', displayName: 'Pricing', category: 'commerce', icon: 'price',
            contractVersion: 1, minimumClientContractVersion: 1,
            roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['pricing.backoffice.read'],
            navigation: [{ id: 'pricing', label: 'Pricing', route: '/pricing', icon: 'pricing', order: 420,
                group: { id: 'commerce', label: 'Commerce', order: 300 },
                perspectives: ['operations', 'commerce'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'ACTIVE', requiredPermissions: ['pricing.backoffice.read'] },
            { id: 'prices', parentId: 'pricing', label: 'Prices', route: '/pricing/prices',
                icon: 'pricing', order: 430, group: { id: 'commerce', label: 'Commerce', order: 300 },
                perspectives: ['operations', 'commerce'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'price-lists', parentId: 'pricing', label: 'Price Lists', route: '/pricing/lists',
                icon: 'pricing', order: 440, group: { id: 'commerce', label: 'Commerce', order: 300 },
                perspectives: ['operations', 'commerce'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'price-groups', parentId: 'pricing', label: 'Price Groups', route: '/pricing/groups',
                icon: 'pricing', order: 450, group: { id: 'commerce', label: 'Commerce', order: 300 },
                perspectives: ['operations', 'commerce'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' },
            { id: 'price-assignment', parentId: 'pricing', label: 'Price Assignment', route: '/pricing/assignment',
                icon: 'pricing', order: 460, group: { id: 'commerce', label: 'Commerce', order: 300 },
                perspectives: ['operations', 'commerce'], contexts: ['environment', 'tenant', 'enterprise'],
                featureState: 'DISABLED' }]
        }
    },
    cache: { pricing: { channels: { resolution: { enabled: true, fallback: true, engine: 'local', ttl: 30 } } } },
    pricing: {
        enterpriseScope: { required: true },
        identity: { separator: '::', maxCodeLength: 128, codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' },
        lifecycle: {
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        priceList: { minimumPriority: 0, maximumPriority: 999999, taxModes: ['NET', 'GROSS'], stackingModes: ['EXCLUSIVE', 'COMBINABLE'] },
        assignment: {
            scopeTypes: ['ENTERPRISE', 'COUNTRY', 'SITE', 'STORE', 'CHANNEL', 'CUSTOMER_SEGMENT', 'CUSTOMER'],
            scopeSpecificity: { ENTERPRISE: 100, COUNTRY: 200, SITE: 300, CHANNEL: 350, STORE: 400, CUSTOMER_SEGMENT: 500, CUSTOMER: 600 },
            minimumPriority: 0, maximumPriority: 999999
        },
        priceGroup: { groupTypes: ['ITEM', 'CUSTOMER', 'CUSTOMER_SEGMENT', 'CONTRACT'], maximumMembers: 10000 },
        price: { maximumScale: 18, maximumDigits: 38, maximumUnitFactor: 1000000000 },
        resolution: {
            requireServiceToken: true, maximumCandidates: 5000, maximumContextValues: 100,
            exactCurrencyRequired: true, failOnAmbiguity: true,
            contextKeys: ['countryCode', 'siteCode', 'storeCode', 'channelCode', 'customerCode', 'customerSegmentCodes', 'customerGroupCodes', 'contractCodes']
        },
        cache: { enabled: true, moduleName: 'pricing', channelName: 'resolution', keyPrefix: 'priceResolution:', ttlSeconds: 30, maximumKeyLength: 256, cacheExplicitEvaluationTime: false },
        references: {
            providers: { store: 'DefaultPricingStoreReferenceProviderService', customer: null, customerSegment: null, item: null, unit: 'DefaultPricingUnitsReferenceProviderService' },
            requireValidationWhenConfigured: true
        },
        storeReference: { moduleName: 'store', apiVersion: 'v0', apiName: '/references/stores/resolve', requestTimeoutMs: 2000, maximumAttempts: 2, preferLocal: true },
        unitsReference: { moduleName: 'units', apiVersion: 'v0', apiName: '/references/units/convert', requestTimeoutMs: 2000, maximumAttempts: 2, preferLocal: true },
        storefrontContext: { headerName: 'x-nodics-storefront-context', moduleName: 'storefront', apiVersion: 'v0',
            apiName: '/context/introspect', bootstrapTenant: 'default', preferLocal: true, requestTimeoutMs: 1000,
            maximumAttempts: 1, maximumResponseBytes: 32768 },
        currencyConversion: { enabled: false, provider: null },
        management: {
            maximumResultCount: 500, maximumPreviewRecords: 5000, maximumPayloadBytes: 262144,
            allowedResources: ['priceLists', 'assignments', 'groups', 'memberships', 'prices']
        },
        workflow: {
            enabled: true, defaultMode: 'MANUAL', modes: ['MANUAL', 'AUTOMATIC'],
            manualWorkflowCode: 'pricingPublicationManualFlow', automaticWorkflowCode: 'pricingPublicationAutomaticFlow',
            maximumAssociatedItems: 10000,
            allowedAssociatedSchemas: ['priceList', 'priceListAssignment', 'priceGroup', 'priceGroupMember', 'price']
        },
        publication: {
            enabled: false, runtimeRole: 'UNASSIGNED', rootTypes: { PRICE_LIST: { schema: 'priceList', service: 'DefaultPriceListService' } }, maxDependencies: 10000,
            targetTransportProvider: null, target: { moduleName: null, connectionName: null, connectionType: 'abstract', timeoutMs: 30000, maxAttempts: 3, maxManifestBytes: 5242880, supportedContractVersions: [1] }
        }
    },
    publish: { providers: { domainAdapters: { pricing: 'DefaultPricingPublicationAdapterService' }, versionProviders: { pricing: 'DefaultPricingPublicationVersionProviderService' } } }
};
