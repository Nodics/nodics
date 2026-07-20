/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

/** Focused contract and behavior coverage for the CMS Phase 0/1 delivery foundation. */
const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const schemas = require(path.join(root, 'gContent/cms/src/schemas/schemas'));
const routes = require(path.join(root, 'gContent/cms/src/router/routers')).cms;
const initialTypes = require(path.join(root, 'gContent/cms/data/init/data/content/defaultCmsTypeCodeData'));
const validation = require(path.join(root, 'gContent/cms/src/service/validation/defaultCmsContractValidationService'));

assert.strictEqual(Object.keys(initialTypes).length, new Set(Object.keys(initialTypes)).size);
assert(Object.values(initialTypes).some(item => item.code === 'menuLinkComponentType'));
assert(Object.values(initialTypes).some(item => item.code === 'navigationalComponentType'));

['cmsPageRoute', 'cmsPageTemplate', 'cmsSlotDefinition'].forEach(name => {
    assert(schemas.cms[name] && schemas.cms[name].model, name + ' must be an owned CMS model');
});
assert(schemas.cms.cmsTypeCode.definition.kind, 'existing cmsTypeCode must remain the component/page type authority');
assert(schemas.cms.cmsTypeCode.definition.propertySchema, 'type authority must support declarative property contracts');
assert.strictEqual(routes.cmsDelivery.resolvePublicPage.publicAccess, true);
assert.strictEqual(routes.cmsDelivery.resolvePublicPage.secured, false);
assert.strictEqual(routes.cmsDelivery.resolveAuthenticatedPage.secured, true);
assert.strictEqual(routes.cmsDelivery.resolveAuthenticatedPage.permissionConfig, 'cms.delivery.authenticatedPermission');

global.CONFIG = { get: () => undefined };
global.SERVICE = {
    DefaultCmsComponentDetailService: {
        get: () => Promise.resolve({ result: [] })
    }
};

(async () => {
    await validation.validateRenderer({ model: { renderer: 'component.hero-banner' } });
    await assert.rejects(validation.validateRenderer({ model: { renderer: 'https://host/view.js' } }), error => error.code === 'CMS_RENDERER_KEY_INVALID');
    let route = { model: { path: '//account///profile', routeType: 'PAGE' } };
    await validation.validateRoute(route);
    assert.strictEqual(route.model.path, '/account/profile');
    await assert.rejects(validation.validateRoute({ model: { path: 'https://host/path', routeType: 'PAGE' } }), error => error.code === 'CMS_ROUTE_PATH_INVALID');
    await validation.validateAssociation({ tenant: 'tenant-a', model: { source: 'page', target: 'hero', index: 0 }, options: {} });

    global._ = require('lodash');
    global.CONFIG = { get: key => key === 'cms' ? { delivery: { maxDepth: 3, maxComponents: 4 } } : undefined };
    const data = {
        routes: [{ site: 'site', path: '/home', locale: 'en', channel: 'web', page: 'home', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC' }],
        pages: [{ code: 'home', name: 'Home', typeCode: 'homePage', renderer: 'page.home', internalNote: 'hidden' }],
        details: [{ code: 'homeHero', source: 'home', target: 'hero', slot: 'main', index: 0, active: true }],
        components: [{ code: 'hero', typeCode: 'heroType', renderer: 'component.hero', properties: { title: 'Hello' }, secret: 'hidden' }]
    };
    const matches = (model, query) => Object.keys(query).every(key => {
        if (key === 'active' && model[key] === undefined) return true;
        let expected = query[key];
        return expected && expected.$in ? expected.$in.includes(model[key]) : model[key] === expected;
    });
    const service = list => ({ get: request => Promise.resolve({ result: list.filter(model => matches(model, request.query)) }) });
    global.SERVICE = {
        DefaultCmsPageRouteService: service(data.routes),
        DefaultCmsPageService: service(data.pages),
        DefaultCmsComponentDetailService: service(data.details),
        DefaultCmsComponentService: service(data.components)
    };
    const deliveryPath = path.join(root, 'gContent/cms/src/service/delivery/defaultCmsDeliveryService');
    delete require.cache[require.resolve(deliveryPath)];
    const delivery = require(deliveryPath);
    let response = await delivery.resolvePage({ tenant: 'tenant-a', authData: {}, options: {}, router: { publicAccess: true }, delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } });
    assert.strictEqual(response.result.contractVersion, 1);
    assert.strictEqual(response.result.page.components[0].code, 'hero');
    assert.strictEqual(response.result.page.internalNote, undefined);
    assert.strictEqual(response.result.page.components[0].secret, undefined);
    data.routes[0].deliveryState = 'DRAFT';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', router: { publicAccess: true }, delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } }), error => error.code === 'CMS_ROUTE_NOT_FOUND');
    data.routes[0].deliveryState = 'ONLINE';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', delivery: { site: 'site', path: 'https://host' } }), error => error.code === 'CMS_DELIVERY_PATH_INVALID');
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', delivery: { site: 'site', path: '/missing', locale: 'en', channel: 'web' } }), error => error.code === 'CMS_ROUTE_NOT_FOUND');

    const overridden = Object.assign({}, delivery, {
        normalizeContext: request => ({ site: request.delivery.site, path: '/home', locale: 'en', channel: 'web' })
    });
    let customized = await overridden.resolvePage({ tenant: 'tenant-a', router: { publicAccess: true }, delivery: { site: 'site', path: '/customer-alias' } });
    assert.strictEqual(customized.result.path, '/home', 'later service override must customize effective resolution behavior');

    let invalidationRequest;
    global.SERVICE.DefaultCacheService = {
        invalidateResource: request => { invalidationRequest = request; return Promise.resolve(true); }
    };
    const invalidation = require(path.join(root, 'gContent/cms/src/service/delivery/defaultCmsDeliveryCacheInvalidationService'));
    await invalidation.invalidate({ tenant: 'tenant-a', authData: { tenant: 'tenant-a' } });
    assert.strictEqual(invalidationRequest.tenant, 'tenant-a');
    assert.strictEqual(invalidationRequest.cacheType, 'router');
    assert.strictEqual(invalidationRequest.resourceName, 'cmsDelivery');
    console.log('CMS content delivery contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
