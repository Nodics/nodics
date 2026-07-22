/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** @module product/config/properties @description Layered Product policy, provider, API, and BackOffice capability configuration. @layer configuration @owner product */
module.exports = {
    backofficeCapabilities: {
        product: {
            enabled: true, capabilityId: 'product-management', displayName: 'Products', category: 'commerce', icon: 'product',
            contractVersion: 1, minimumClientContractVersion: 1, roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            requiredPermissions: ['product.backoffice.read'],
            navigation: [{ id: 'products', label: 'Products', route: '/products', order: 430, requiredPermissions: ['product.backoffice.read'] }]
        }
    },
    product: {
        enterpriseScope: { required: true },
        identity: { separator: '::', maxCodeLength: 128, codePattern: '^[A-Za-z0-9][A-Za-z0-9._-]*$' },
        item: {
            itemTypes: ['PRODUCT', 'SKU', 'SERVICE', 'ASSET', 'BUNDLE'],
            stockManagedTypes: ['SKU', 'ASSET', 'BUNDLE'],
            sellableTypes: ['SKU', 'SERVICE', 'ASSET', 'BUNDLE'],
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] },
            maximumNameLength: 256, maximumDescriptionLength: 16384
        },
        identifier: {
            types: ['EAN', 'UPC', 'GTIN', 'ISBN', 'MANUFACTURER', 'PARCEL', 'TITLE', 'EXTERNAL'],
            maximumValueLength: 256
        },
        category: {
            maximumDepth: 32, minimumOrder: 0, maximumOrder: 999999,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        categoryAssignment: {
            minimumPosition: 0, maximumPosition: 999999,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        attribute: {
            valueTypes: ['TEXT', 'BOOLEAN', 'INTEGER', 'DECIMAL', 'DATE', 'ENUM', 'REFERENCE', 'MEASURED'],
            referenceTypes: ['PRODUCT_ITEM', 'EXTERNAL'], locales: { pattern: '^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$' },
            maximumTextLength: 16384, maximumEnumValues: 1000, maximumValues: 1000,
            maximumDigits: 38, maximumScale: 18,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        classification: {
            maximumAttributesPerClass: 1000, maximumClassesPerItem: 100,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        variant: {
            baseItemTypes: ['PRODUCT'], variantItemTypes: ['SKU', 'ASSET'],
            axisValueTypes: ['TEXT', 'BOOLEAN', 'INTEGER', 'DECIMAL', 'ENUM', 'REFERENCE', 'MEASURED'],
            maximumAxesPerBase: 20, maximumVariantsPerBase: 10000, maximumHierarchyDepth: 8,
            requireSellableVariant: true,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        relation: {
            types: ['ACCESSORY', 'COMPATIBLE', 'REPLACEMENT', 'SUBSTITUTE', 'CROSS_SELL', 'UP_SELL', 'RELATED'],
            symmetricTypes: ['COMPATIBLE', 'SUBSTITUTE', 'RELATED'], acyclicTypes: ['REPLACEMENT', 'UP_SELL'],
            allowCrossCatalog: false, maximumRelationsPerItem: 1000, maximumGraphDepth: 32,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        bundle: {
            bundleItemTypes: ['BUNDLE'], maximumEntries: 1000, maximumDepth: 16, maximumDigits: 38, maximumScale: 18,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        packaging: {
            types: ['EACH', 'PACK', 'BOX', 'CASE', 'PALLET', 'CONTAINER'], maximumEntriesPerItem: 100,
            maximumDigits: 38, maximumScale: 18,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        media: {
            types: ['IMAGE', 'VIDEO', 'DOCUMENT', 'MODEL'], roles: ['PRIMARY', 'GALLERY', 'THUMBNAIL', 'MANUAL', 'DATASHEET'],
            allowedSchemes: ['https'], maximumEntriesPerItem: 1000, maximumUriLength: 2048,
            statuses: ['DRAFT', 'ACTIVE', 'SUSPENDED', 'RETIRED'],
            allowedTransitions: { DRAFT: ['ACTIVE', 'RETIRED'], ACTIVE: ['SUSPENDED', 'RETIRED'], SUSPENDED: ['ACTIVE', 'RETIRED'], RETIRED: [] }
        },
        references: {
            providers: { catalog: 'DefaultProductCatalogReferenceProviderService', unit: 'DefaultProductUnitsReferenceProviderService' },
            requireValidationWhenConfigured: true
        },
        catalogReference: { moduleName: 'catalog', apiVersion: 'v0', preferLocal: true, maximumResults: 2 },
        unitsReference: { moduleName: 'units', apiVersion: 'v0', apiName: '/references/units/convert', requestTimeoutMs: 2000, maximumAttempts: 2, preferLocal: true },
        management: { maximumResultCount: 500, maximumPayloadBytes: 262144, allowedResources: ['items', 'identifiers', 'categories', 'categoryAssignments', 'attributeDefinitions', 'attributeValues', 'classificationClasses', 'classificationAssignments', 'variantAxes', 'variantAssignments', 'relations', 'bundleEntries', 'packaging', 'mediaReferences'] },
        workflow: { enabled: true, defaultMode: 'MANUAL', modes: ['MANUAL', 'AUTOMATIC'], manualWorkflowCode: 'productPublicationManualFlow', automaticWorkflowCode: 'productPublicationAutomaticFlow', maximumAssociatedItems: 20000, allowedAssociatedSchemas: ['productItem', 'productIdentifier', 'productCategory', 'productCategoryAssignment', 'productAttributeDefinition', 'productAttributeValue', 'productClassificationClass', 'productClassificationAssignment', 'productVariantAxis', 'productVariantAssignment', 'productRelation', 'productBundleEntry', 'productPackaging', 'productMediaReference'] },
        publication: { enabled: false, runtimeRole: 'UNASSIGNED', rootTypes: { PRODUCT_ITEM: { schema: 'productItem', service: 'DefaultProductItemService' } }, maxDependencies: 20000, targetTransportProvider: null, target: { moduleName: null, connectionName: null, connectionType: 'abstract', timeoutMs: 30000, maxAttempts: 3, maxManifestBytes: 20971520, supportedContractVersions: [1] } },
        delivery: { maximumExpansions: 8, maximumRecordsPerExpansion: 1000, allowedExpansions: ['identifiers', 'categories', 'attributes', 'classifications', 'variants', 'relations', 'bundles', 'packaging', 'media'], localePattern: '^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$' },
        storefrontContext: { headerName: 'x-nodics-storefront-context', moduleName: 'storefront', apiVersion: 'v0',
            apiName: '/context/introspect', bootstrapTenant: 'default', preferLocal: true, requestTimeoutMs: 1000,
            maximumAttempts: 1, maximumResponseBytes: 32768 },
        cache: { enabled: true, moduleName: 'product', channelName: 'delivery', keyPrefix: 'productDelivery:', ttlSeconds: 300, maximumKeyLength: 256 },
        searchProjection: { enabled: false, provider: 'DefaultProductSearchProjectionProviderService', indexerCode: 'productOnlineIndexer', indexName: 'productOnline', maximumDocuments: 20000 },
        projection: { enabled: true, maximumAttempts: 10, reconciliationBatchSize: 100, retryStates: ['PENDING', 'PARTIAL', 'FAILED'] },
        referenceLookup: { maximumResultCount: 100, allowedItemTypes: ['PRODUCT', 'SKU', 'SERVICE', 'ASSET', 'BUNDLE'] }
    },
    cache: { product: { channels: { delivery: { enabled: true, fallback: true, engine: 'local', ttl: 300 } } } },
    publish: { providers: { domainAdapters: { product: 'DefaultProductPublicationAdapterService' }, versionProviders: { product: 'DefaultProductPublicationVersionProviderService' } } }
};
