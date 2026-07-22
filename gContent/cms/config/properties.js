/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/config/properties
 * @description Reserved CMS property contribution for module-level content configuration defaults.
 * @layer config
 * @owner cms
 * @override Project modules may provide later property contributions for CMS rendering, data, and integration settings.
 */
module.exports = {
    backofficeCapabilities: {
        cms: {
            enabled: true, capabilityId: 'content-management', displayName: 'Content Management', category: 'content', icon: 'content',
            contractVersion: 1, minimumClientContractVersion: 1,
            roles: ['UI_COMPOSITION_PROVIDER', 'FUNCTIONAL_CAPABILITY_PROVIDER'],
            discovery: { openApiPath: '/nodics/system/v0/contract/openapi/internal', contractVersion: 1 },
            uiComposition: { site: 'cmsDefaultSite', catalog: 'cmsDefaultContentCatalog', defaultPage: 'cmsDefaultPage', fallbackMode: 'STATIC_RECOVERY_SHELL' },
            requiredPermissions: ['cms.backoffice.view'],
            navigation: [{ id: 'cms', label: 'Content', route: '/content', order: 200, requiredPermissions: ['cms.backoffice.view'] }]
        }
    },
    cms: {
        referenceLookup: { requireServiceToken: true, maximumResultCount: 1 },
        delivery: {
            defaultLocale: 'default',
            defaultChannel: 'web',
            maxDepth: 12,
            maxComponents: 500,
            cacheTtl: 30000,
            publicAccessGroups: ['userGroup'],
            authenticatedAccessGroups: ['userGroup'],
            authenticatedPermission: 'cms.delivery.authenticated.read'
        },
        storefrontContext: { headerName: 'x-nodics-storefront-context', moduleName: 'storefront', apiVersion: 'v0',
            apiName: '/context/introspect', bootstrapTenant: 'default', preferLocal: true, requestTimeoutMs: 1000,
            maximumAttempts: 1, maximumResponseBytes: 32768 },
        renderer: {
            keyPattern: '^[a-z][a-z0-9]*(\\.[a-z][a-z0-9-]*)+$',
            prohibitedSchemes: ['http:', 'https:', 'javascript:', 'data:', 'file:']
        },
        migration: {
            version: 1,
            rendererMappings: {
                'pages/home/sampleHomePage.html': 'page.home',
                'pages/product/sampleProductDetailPage.html': 'page.product-detail',
                'pages/product/sampleProductListingPage.html': 'page.product-listing',
                'pages/cart/sampleCartDetailPage.html': 'page.cart-detail',
                'pages/components/sampleHeaderComponent.html': 'component.header'
            },
            routeMappings: [],
            identifierMappings: []
        },
        publication: {
            enabled: false,
            runtimeRole: 'UNASSIGNED',
            maxDependencies: 500,
            maxDepth: 12,
            manifestService: 'DefaultCmsPublicationManifestOrchestrationService',
            targetTransportProvider: null,
            target: {
                moduleName: null,
                connectionName: null,
                connectionType: 'abstract',
                timeoutMs: 30000,
                maxAttempts: 3,
                maxManifestBytes: 5242880,
                supportedContractVersions: [1]
            },
            rootTypes: {
                pageRoute: { schema: 'cmsPageRoute', service: 'DefaultCmsPageRouteService' }
            }
        }
    },
    publish: {
        providers: {
            domainAdapters: { cms: 'DefaultCmsPublicationAdapterService' },
            versionProviders: { cms: 'DefaultCmsPublicationVersionProviderService' }
        }
    }
};
