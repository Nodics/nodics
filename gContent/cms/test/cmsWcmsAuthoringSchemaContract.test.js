/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/**
 * @module cms/test/cmsWcmsAuthoringSchemaContract
 * @description Validates CMS-owned WCMS authoring schemas for configuration-first, component-based, customizable Axis BackOffice management.
 * @layer test
 * @owner cms
 * @override Extend when CMS adds new WCMS authoring entities or changes the component, navigation, restriction, and slot contracts.
 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').cms;
const cmsNavigation = require('../config/properties').backofficeCapabilities.cms.navigation;
const validationService = require('../src/service/validation/defaultCmsContractValidationService');
const interceptors = require('../src/interceptors/interceptors');
const statusDefinitions = require('../src/utils/statusDefinitions');

[
    'cmsComponentTypeGroup',
    'cmsNavigationNode',
    'cmsRestrictionType',
    'cmsRestriction'
].forEach(schemaName => {
    assert(schemas[schemaName], schemaName + ' must be a first-class CMS authoring schema');
    assert.strictEqual(schemas[schemaName].model, true, schemaName + ' must generate a model');
    assert.strictEqual(schemas[schemaName].service.enabled, true, schemaName + ' must generate a service');
    assert.strictEqual(schemas[schemaName].router.enabled, true, schemaName + ' must be manageable through generated secured CRUD routes');
    assert.strictEqual(schemas[schemaName].isVersionedEnabled, false, schemaName + ' must stay non-versioned until a deployment layer opts into versioned CMS authoring');
});

assert(schemas.cmsTypeCode.definition.kind, 'cmsTypeCode remains the page/component type authority');
assert(!schemas.cmsComponentType, 'CMS must not introduce a parallel component-type authority');
assert(!schemas.cmsPageType, 'CMS must not introduce a parallel page-type authority');

const navigationWorkbenchTarget = function (route) {
    return cmsNavigation.find(item => item.route === route).workbenchTarget;
};
assert.deepStrictEqual(navigationWorkbenchTarget('/content/pages'), { moduleName: 'cms', schemaName: 'cmsPage' });
assert.deepStrictEqual(navigationWorkbenchTarget('/content/navigation'), { moduleName: 'cms', schemaName: 'cmsNavigationNode' });
assert.deepStrictEqual(navigationWorkbenchTarget('/content/component-type-groups'),
    { moduleName: 'cms', schemaName: 'cmsComponentTypeGroup' });
assert.deepStrictEqual(navigationWorkbenchTarget('/publishing/requests'),
    { moduleName: 'publish', schemaName: 'publicationRequest' });

assert.deepStrictEqual(schemas.cmsComponentTypeGroup.refSchema.componentTypeCodes, {
    enabled: true,
    schemaName: 'cmsTypeCode',
    type: 'many',
    propertyName: 'code',
    searchEnabled: true
});
assert.strictEqual(schemas.cmsComponentTypeGroup.definition.componentTypeCodes.type, 'array');
assert.strictEqual(schemas.cmsComponentTypeGroup.definition.status.default, 'ACTIVE');
assert.deepStrictEqual(schemas.cmsComponentTypeGroup.definition.status.enum, ['ACTIVE', 'INACTIVE']);

assert.strictEqual(schemas.cmsSlotDefinition.definition.allowedComponentTypes.type, 'array');
assert.strictEqual(schemas.cmsSlotDefinition.definition.allowedComponentTypeGroups.type, 'array',
    'template slots must support component type groups without replacing type codes');

assert.deepStrictEqual(schemas.cmsNavigationNode.definition.nodeType.enum, ['PAGE', 'ROUTE', 'EXTERNAL', 'CONTAINER']);
assert.strictEqual(schemas.cmsNavigationNode.definition.site.searchOptions.enabled, true);
assert.strictEqual(schemas.cmsNavigationNode.refSchema.parent.schemaName, 'cmsNavigationNode');
assert.strictEqual(schemas.cmsNavigationNode.refSchema.targetPage.schemaName, 'cmsPage');
assert.strictEqual(schemas.cmsNavigationNode.refSchema.targetRoute.schemaName, 'cmsPageRoute');
assert.strictEqual(schemas.cmsNavigationNode.refSchema.restrictions.schemaName, 'cmsRestriction');
assert.strictEqual(schemas.cmsNavigationNode.definition.externalUrl.description.includes('validation remains service-owned'), true,
    'navigation URL safety must remain a backend service contract');

assert.deepStrictEqual(schemas.cmsRestrictionType.definition.targetTypes.default, ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE']);
assert.strictEqual(schemas.cmsRestrictionType.definition.propertySchema.type, 'object');
assert.strictEqual(schemas.cmsRestrictionType.definition.propertySchema.description.includes('executable code is prohibited'), true);
assert.strictEqual(schemas.cmsRestrictionType.definition.evaluator.description.includes('Logical backend evaluator key'), true);
assert.strictEqual(schemas.cmsRestrictionType.definition.evaluator.description.includes('never executable code'), true);

assert.deepStrictEqual(schemas.cmsRestriction.definition.targetType.enum, ['PAGE', 'COMPONENT', 'SLOT', 'NAVIGATION', 'ROUTE']);
assert.deepStrictEqual(schemas.cmsRestriction.definition.mode.enum, ['INCLUDE', 'EXCLUDE']);
assert.strictEqual(schemas.cmsRestriction.refSchema.restrictionType.schemaName, 'cmsRestrictionType');
assert.strictEqual(schemas.cmsRestriction.definition.properties.description.includes('propertySchema'), true);

assert.strictEqual(schemas.cmsComponentMedia.definition.mediaCode.description.includes('nMedia-owned'), true);
assert.strictEqual(schemas.cmsComponentMedia.definition.mediaSetCode.description.includes('nMedia-owned'), true);
assert.strictEqual(schemas.cmsComponentMedia.definition.storageKey, undefined,
    'CMS authoring schemas must not duplicate nMedia storage keys');

[
    ['ERR_CMS_00095', 'CMS slot definition is invalid'],
    ['ERR_CMS_00096', 'CMS navigation node is invalid'],
    ['ERR_CMS_00097', 'CMS restriction type is invalid'],
    ['ERR_CMS_00098', 'CMS restriction is invalid']
].forEach(([code, message]) => {
    assert.strictEqual(statusDefinitions[code].code, '400');
    assert.strictEqual(statusDefinitions[code].message, message);
});

assert.strictEqual(interceptors.validateCmsSlotDefinition.handler, 'DefaultCmsContractValidationService.validateSlotDefinition');
assert.strictEqual(interceptors.validateCmsNavigationNode.handler, 'DefaultCmsContractValidationService.validateNavigationNode');
assert.strictEqual(interceptors.validateCmsRestrictionType.handler, 'DefaultCmsContractValidationService.validateRestrictionType');
assert.strictEqual(interceptors.validateCmsRestriction.handler, 'DefaultCmsContractValidationService.validateRestriction');
[
    interceptors.invalidateCmsNavigationDeliveryAfterSave,
    interceptors.invalidateCmsNavigationDeliveryAfterUpdate,
    interceptors.invalidateCmsNavigationDeliveryAfterRemove,
    interceptors.invalidateCmsRestrictionDeliveryAfterSave,
    interceptors.invalidateCmsRestrictionDeliveryAfterUpdate,
    interceptors.invalidateCmsRestrictionDeliveryAfterRemove
].forEach(interceptor => {
    assert.strictEqual(interceptor.handler, 'DefaultCmsDeliveryCacheInvalidationService.invalidate');
});

const matchingService = function (property, validCode) {
    return {
        get: function (request) {
            return Promise.resolve({
                result: request.query && request.query[property] === validCode ? [{ code: validCode, active: true }] : []
            });
        }
    };
};

const navigationService = function (parentsByCode) {
    return {
        get: function (request) {
            let code = request.query && request.query.code;
            return Promise.resolve({
                result: parentsByCode[code] ? [{ code: code, parent: parentsByCode[code], active: true }] : []
            });
        }
    };
};

global.CONFIG = {
    get: function () { return undefined; }
};

(async function validateWcmsAuthoringServices() {
    global.SERVICE = {};
    await validationService.validateSlotDefinition({
        model: {
            code: 'homepage-main',
            minItems: 0,
            maxItems: 4,
            allowedComponentTypes: ['cms.hero.banner'],
            allowedComponentTypeGroups: ['contentComponents']
        }
    });
    await assert.rejects(() => validationService.validateSlotDefinition({
        model: { code: 'homepage-main', minItems: 4, maxItems: 2 }
    }), error => error.code === 'ERR_CMS_00095');

    global.SERVICE = {
        DefaultCmsPageService: matchingService('code', 'home'),
        DefaultCmsPageRouteService: matchingService('code', 'home-route'),
        DefaultCmsNavigationNodeService: navigationService({ parent: 'root', root: null }),
        DefaultCmsRestrictionTypeService: matchingService('code', 'user-group'),
        DefaultCmsComponentService: matchingService('code', 'hero'),
        DefaultCmsSlotDefinitionService: matchingService('code', 'homepage-main')
    };

    await validationService.validateNavigationNode({
        model: { code: 'child', site: 'storefront', parent: 'parent', nodeType: 'PAGE', targetPage: 'home' }
    });
    await validationService.validateNavigationNode({
        model: { code: 'route-link', site: 'storefront', nodeType: 'ROUTE', targetRoute: 'home-route' }
    });
    await validationService.validateNavigationNode({
        model: { code: 'external-link', site: 'storefront', nodeType: 'EXTERNAL', externalUrl: 'https://example.com/help' }
    });
    await assert.rejects(() => validationService.validateNavigationNode({
        model: { code: 'unsafe-link', site: 'storefront', nodeType: 'EXTERNAL', externalUrl: 'javascript:alert(1)' }
    }), error => error.code === 'ERR_CMS_00096');

    global.SERVICE.DefaultCmsNavigationNodeService = navigationService({ parent: 'child' });
    await assert.rejects(() => validationService.validateNavigationNode({
        model: { code: 'child', site: 'storefront', parent: 'parent', nodeType: 'CONTAINER' }
    }), error => error.code === 'ERR_CMS_00096');

    await validationService.validateRestrictionType({
        model: {
            code: 'user-group',
            targetTypes: ['PAGE', 'COMPONENT'],
            propertySchema: { userGroups: { type: 'array' } },
            evaluator: 'cms.user-group'
        }
    });
    assert.strictEqual(validationService.safeLogicalKey('cms.user-group'), true);
    assert.strictEqual(validationService.safeLogicalKey('https://example.com/evaluator'), false);
    assert.throws(() => validationService.validateRestrictionType({
        model: { code: 'bad-target', targetTypes: ['PRODUCT'] }
    }), error => error.code === 'ERR_CMS_00097');
    assert.throws(() => validationService.validateRestrictionType({
        model: { code: 'bad-evaluator', evaluator: 'https://example.com/evaluator' }
    }), error => error.code === 'ERR_CMS_00097');

    global.SERVICE.DefaultCmsNavigationNodeService = navigationService({ parent: 'root', root: null });
    await validationService.validateRestriction({
        model: {
            code: 'home-user-group',
            restrictionType: 'user-group',
            targetType: 'PAGE',
            targetCode: 'home',
            mode: 'INCLUDE',
            properties: { userGroups: ['contentApprover'] }
        }
    });
    await assert.rejects(() => validationService.validateRestriction({
        model: { code: 'missing-type', restrictionType: 'missing', targetType: 'PAGE', targetCode: 'home' }
    }), error => error.code === 'ERR_CMS_00098');

    console.log('CMS WCMS authoring schema contract validated');
})().catch(error => {
    console.error(error);
    process.exit(1);
});
