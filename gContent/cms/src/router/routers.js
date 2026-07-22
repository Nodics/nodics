/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/router/routers
 * @description Reserved CMS route contribution for custom CMS APIs beyond generated schema routes.
 * @layer router
 * @owner cms
 * @override Project modules may add, remove, or replace CMS routes through governed router hierarchy contributions.
 */
module.exports = {
  cms: {
    cmsMigration: {
        previewMigration: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'cms.migration.preview', key: '/migration/preview', method: 'POST', controller: 'DefaultCmsMigrationController', operation: 'previewMigration' },
        applyMigration: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'cms.migration.apply', key: '/migration/apply', method: 'POST', controller: 'DefaultCmsMigrationController', operation: 'applyMigration' },
        rollbackMigration: { secured: true, accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'cms.migration.rollback', key: '/migration/rollback', method: 'POST', controller: 'DefaultCmsMigrationController', operation: 'rollbackMigration' }
    },
    cmsDelivery: {
        resolvePublicPage: {
            secured: false,
            publicAccess: true,
            accessGroups: ['userGroup'],
            key: '/delivery/pages/resolve',
            method: 'GET',
            controller: 'DefaultCmsDeliveryController',
            operation: 'resolvePage',
            cache: { enabled: true, ttl: 30000 },
            help: {
                requestType: 'public',
                message: 'Resolve an Online CMS page graph by site, path, locale, and channel.',
                method: 'GET',
                url: 'http://host:port/nodics/cms/delivery/pages/resolve?site=siteCode&path=/home&locale=en&channel=web'
            }
        },
        resolveAuthenticatedPage: {
            secured: true,
            accessGroups: ['userGroup'],
            permissionConfig: 'cms.delivery.authenticatedPermission',
            key: '/delivery/pages/resolve/authenticated',
            method: 'GET',
            controller: 'DefaultCmsDeliveryController',
            operation: 'resolvePage',
            cache: { enabled: true, ttl: 30000 },
            help: {
                requestType: 'secured',
                message: 'Resolve an authenticated CMS page graph within the authorized tenant context.',
                method: 'GET',
                url: 'http://host:port/nodics/cms/delivery/pages/resolve/authenticated?site=siteCode&path=/account&locale=en&channel=web'
            }
        },
        resolveStorefrontPage: {
            secured: false,
            publicAccess: true,
            accessGroups: ['userGroup'],
            apiExposure: 'cmsDelivery',
            key: '/delivery/storefront/pages/resolve',
            method: 'GET',
            controller: 'DefaultCmsDeliveryController',
            operation: 'resolveStorefrontPage',
            cache: { enabled: false },
            help: { requestType: 'public', message: 'Resolve one Online CMS page from an opaque Storefront context.',
                parameters: [{ name: 'x-nodics-storefront-context', in: 'header', required: true,
                    description: 'Opaque short-lived context handle issued by Storefront.', schema: { type: 'string' } },
                { name: 'path', in: 'query', required: true, schema: { type: 'string' } }] },
            responses: { '200': { description: 'Storefront-bound Online CMS page graph' },
                '401': { description: 'Storefront context is missing, inactive, expired, or unavailable' },
                '404': { description: 'Published CMS route or content is unavailable' } }
        }
    },
    cmsReference: {
        resolveSite: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
            permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'moduleInternal',
            key: '/references/sites/resolve', method: 'POST', controller: 'DefaultCmsSiteReferenceController', operation: 'resolve',
            requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: false,
                required: ['cmsSiteCode'], properties: { cmsSiteCode: { type: 'string', minLength: 1, maxLength: 128 } } } } } },
            responses: { '200': { description: 'Bounded active CMS Site reference projection' } }
        }
    },
    cmsPublicationTarget: {
        deployPublication: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/deploy', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'deploy'
        },
        getPublicationStatus: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/status', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'getStatus'
        },
        rollbackPublication: {
            secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'], permissionConfig: 'authSecurity.internalToken.routePermission',
            apiExposure: 'moduleInternal', key: '/publication/target/rollback', method: 'POST',
            controller: 'DefaultCmsPublicationTargetController', operation: 'rollback'
        }
    }
  }
};
