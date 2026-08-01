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
            navigation: [{ id: 'cms', label: 'Web Content Management System', route: '/content', icon: 'cms', order: 200,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsPage' },
                help: { summary: 'Manage the Web Content Management System authoring area for websites, pages, templates, components, navigation, restrictions, and publishing.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'what-is-the-web-content-management-model' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'sites', parentId: 'cms', label: 'Websites', route: '/content/sites', icon: 'cms', order: 205,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsSite' },
                help: { summary: 'Manage CMS websites that group authoring and delivery context for a storefront, brand site, or enterprise experience.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'websites' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'content-catalogs', parentId: 'cms', label: 'Content Catalogs', route: '/content/catalogs', icon: 'cms', order: 210,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'catalog', schemaName: 'catalog' },
                help: { summary: 'Manage content catalogs that organize CMS content for governed authoring, preview, and delivery.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'content-catalogs' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'type-codes', parentId: 'cms', label: 'Page and Component Types', route: '/content/type-codes', icon: 'cms', order: 215,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsTypeCode' },
                help: { summary: 'Review CMS page and component type codes that connect backend content models with Axis renderer contracts.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'page-and-component-types' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'component-type-groups', parentId: 'cms', label: 'Component Type Groups', route: '/content/component-type-groups', icon: 'cms', order: 220,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsComponentTypeGroup' },
                help: { summary: 'Group CMS component types so authors and administrators can organize reusable content building blocks.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'component-type-groups' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'renderer-mappings', parentId: 'cms', label: 'Renderer Mappings', route: '/content/renderer-mappings', icon: 'cms', order: 225,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsTypeCode2Renderer' },
                help: { summary: 'Map CMS type codes to approved Axis renderers and contract versions without allowing executable frontend content.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'renderer-mappings' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'page-templates', parentId: 'cms', label: 'Page Templates', route: '/content/page-templates', icon: 'cms', order: 230,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsPageTemplate' },
                help: { summary: 'Manage page templates that define the governed layout structure and allowed content slots for CMS pages.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'page-templates' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'slot-definitions', parentId: 'cms', label: 'Slot Definitions', route: '/content/slot-definitions', icon: 'cms', order: 235,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsSlotDefinition' },
                help: { summary: 'Manage reusable slot definitions that decide where CMS components can appear inside templates and pages.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'slot-definitions' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'pages', parentId: 'cms', label: 'Pages', route: '/content/pages', icon: 'cms', order: 240,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsPage' },
                help: { summary: 'Manage CMS pages, their templates, content slots, components, restrictions, and delivery state.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'pages' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'components', parentId: 'cms', label: 'Components', route: '/content/components', icon: 'cms', order: 245,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsComponent' },
                help: { summary: 'Manage reusable CMS components that render page content through approved Axis renderer mappings.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'components' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'component-media', parentId: 'cms', label: 'Component Media', route: '/content/component-media', icon: 'cms', order: 250,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsComponentMedia' },
                help: { summary: 'Manage references between CMS components and governed media assets owned by nMedia.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'component-media' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'routes', parentId: 'cms', label: 'Page Routes', route: '/content/routes', icon: 'cms', order: 255,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsPageRoute' },
                help: { summary: 'Manage browser route mappings that resolve safe URLs to CMS pages through backend-owned routing contracts.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'page-routes' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'navigation', parentId: 'cms', label: 'Navigation Nodes', route: '/content/navigation', icon: 'cms', order: 260,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsNavigationNode' },
                help: { summary: 'Manage CMS navigation tree entries and their page, route, or approved external targets.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'navigation-nodes' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'restriction-types', parentId: 'cms', label: 'Restriction Types', route: '/content/restriction-types', icon: 'cms', order: 265,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsRestrictionType' },
                help: { summary: 'Review restriction type definitions used to govern when pages, components, or navigation entries are visible.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'restriction-types' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'restrictions', parentId: 'cms', label: 'Restrictions', route: '/content/restrictions', icon: 'cms', order: 270,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsRestriction' },
                help: { summary: 'Manage configured restrictions that control CMS visibility for users, channels, catalogs, or business contexts.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'restrictions' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'publishing', label: 'Publishing', route: '/publishing', icon: 'workflow', order: 280,
                group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'],
                contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'publish', schemaName: 'publicationRequest' },
                help: { summary: 'Review and manage governed publication from staged authoring content to online delivery state.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'publishing' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'publishing-requests', parentId: 'publishing', label: 'Publishing Requests', route: '/publishing/requests',
                icon: 'workflow', order: 290, group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'publish', schemaName: 'publicationRequest' },
                help: { summary: 'Create and inspect publication requests that move approved content toward online delivery.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'publishing-requests' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'publishing-status', parentId: 'publishing', label: 'Staged-to-Online Status', route: '/publishing/status',
                icon: 'workflow', order: 300, group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsOnlinePublicationPointer' },
                help: { summary: 'Review which CMS content has an active staged-to-online publication pointer for delivery.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'staged-to-online-status' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'publishing-manifests', parentId: 'publishing', label: 'Publication Manifests', route: '/publishing/manifests',
                icon: 'workflow', order: 305, group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsPublicationManifest' },
                help: { summary: 'Inspect generated publication manifests that describe exactly what content was prepared for delivery.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'publication-manifests' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'publishing-history', parentId: 'publishing', label: 'Publishing History', route: '/publishing/history',
                icon: 'workflow', order: 310, group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'cms', schemaName: 'cmsPublicationDeploymentReceipt' },
                help: { summary: 'Inspect publication deployment receipts and historical evidence from completed publishing operations.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'publishing-history' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] },
            { id: 'publishing-audit', parentId: 'publishing', label: 'Publishing Audit', route: '/publishing/audit',
                icon: 'workflow', order: 320, group: { id: 'content', label: 'Content and Experience', order: 200 },
                perspectives: ['operations', 'content'], contexts: ['environment', 'tenant', 'enterprise', 'site', 'catalog'],
                workbenchTarget: { moduleName: 'publish', schemaName: 'publicationAudit' },
                help: { summary: 'Review publishing audit records for operational traceability and content governance evidence.', documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model', documentationFragment: 'publishing-audit' },
                featureState: 'ACTIVE', requiredPermissions: ['cms.backoffice.view'] }]
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
            cacheResourceNames: ['resolvePublicPage', 'resolveAuthenticatedPage'],
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
        mediaReference: {
            moduleName: 'media',
            apiVersion: 'v0',
            apiName: '/references/media/validate',
            preferLocal: true,
            requestTimeoutMs: 2000,
            maximumAttempts: 2,
            maximumReferencesPerComponent: 200,
            mediaTypes: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FILE', 'MIXED'],
            roles: ['primary', 'background', 'thumbnail', 'icon', 'gallery', 'document', 'video', 'mobile', 'desktop'],
            localePattern: '^[A-Za-z]{2,3}(?:[-_][A-Za-z0-9]{2,8})*$'
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
