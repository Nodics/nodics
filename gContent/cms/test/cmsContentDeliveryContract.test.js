/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Focused contract and behavior coverage for the CMS Phase 0/1 delivery foundation. */
const assert = require('assert');
const path = require('path');

const root = path.resolve(__dirname, '../../..');
const schemas = require(path.join(root, 'gContent/cms/src/schemas/schemas'));
const routes = require(path.join(root, 'gContent/cms/src/router/routers')).cms;
const statusDefinitions = require(path.join(root, 'gContent/cms/src/utils/statusDefinitions'));
const initialTypes = require(path.join(root, 'gContent/cms/data/init/data/content/defaultCmsTypeCodeData'));
const sampleHeaderComponents = require(path.join(root, 'gContent/cms/data/sample/data/components/sampleHeaderCmsComponentData'));
const validation = require(path.join(root, 'gContent/cms/src/service/validation/defaultCmsContractValidationService'));

assert.strictEqual(Object.keys(initialTypes).length, new Set(Object.keys(initialTypes)).size);
assert(Object.values(initialTypes).some(item => item.code === 'menuLinkComponentType'));
assert(Object.values(initialTypes).some(item => item.code === 'navigationalComponentType'));

['cmsPageRoute', 'cmsPageTemplate', 'cmsSlotDefinition'].forEach(name => {
    assert(schemas.cms[name] && schemas.cms[name].model, name + ' must be an owned CMS model');
});
assert(schemas.cms.cmsTypeCode.definition.kind, 'existing cmsTypeCode must remain the component/page type authority');
assert(schemas.cms.cmsTypeCode.definition.propertySchema, 'type authority must support declarative property contracts');
assert(schemas.cms.cmsTypeCode.definition.mediaSchema, 'type authority must support declarative media-association contracts');
assert.deepStrictEqual(schemas.cms.cmsTypeCode2Renderer.definition.channels.default, ['web']);
assert.strictEqual(schemas.cms.cmsTypeCode2Renderer.definition.deprecated.type, 'bool',
    'persistent CMS boolean fields must use the MongoDB BSON bool type');
assert.strictEqual(schemas.cms.cmsTypeCode2Renderer.definition.deprecated.default, false);
assert(schemas.cms.cmsTypeCode2Renderer.definition.replacementRenderer);
assert(schemas.cms.cmsComponent.definition.properties, 'component delivery properties must be an explicit schema contract');
assert.strictEqual(schemas.cms.cmsComponent.definition.accessMode.default, 'AUTHENTICATED');
assert(schemas.cms.cmsComponentMedia.definition.componentMediaCode, 'CMS must own structured component media associations');
assert(schemas.cms.cmsComponentMedia.definition.componentCode, 'CMS component medias must point to a CMS component');
assert(schemas.cms.cmsComponentMedia.definition.mediaCode, 'CMS component medias may point to one nMedia media item');
assert(schemas.cms.cmsComponentMedia.definition.mediaSetCode, 'CMS component medias may point to one nMedia media set');
const typeByCode = Object.values(initialTypes).reduce((accumulator, item) => {
    accumulator[item.code] = item;
    return accumulator;
}, {});
['imageComponentType', 'imagesComponentType', 'imageTextComponentType', 'homePageBannerComponentType'].forEach(typeCode => {
    assert(typeByCode[typeCode].mediaSchema, typeCode + ' must declare its CMS-owned media association contract');
});
assert.strictEqual(typeByCode.imageComponentType.propertySchema.mediaCode, undefined, 'media item codes do not belong in generic component properties');
assert.strictEqual(typeByCode.homePageBannerComponentType.propertySchema.mediaSetCode, undefined, 'media set codes do not belong in generic component properties');
assert.strictEqual(sampleHeaderComponents.record2.media, undefined, 'CMS samples must not store raw media objects or URLs');
assert.strictEqual(sampleHeaderComponents.record2.properties, undefined, 'CMS sample media association belongs in cmsComponentMedia data');
assert.strictEqual(routes.cmsDelivery.resolvePublicPage.publicAccess, true);
assert.strictEqual(routes.cmsDelivery.resolvePublicPage.secured, false);
assert.strictEqual(routes.cmsDelivery.resolveAuthenticatedPage.secured, true);
assert.strictEqual(routes.cmsDelivery.resolveAuthenticatedPage.permissionConfig, 'cms.delivery.authenticatedPermission');
assert.strictEqual(statusDefinitions.ERR_CMS_00087.code, '404');
assert.strictEqual(statusDefinitions.ERR_CMS_00086.code, '403');
assert.strictEqual(statusDefinitions.ERR_CMS_00092.code, '422');
assert.strictEqual(statusDefinitions.ERR_CMS_00093.code, '422');

global.CONFIG = { get: () => undefined };
global.SERVICE = {
    DefaultCmsComponentDetailService: {
        get: () => Promise.resolve({ result: [] })
    },
    DefaultCmsComponentMediaService: {
        get: () => Promise.resolve({ result: [] })
    },
    DefaultCmsComponentService: {
        get: () => Promise.resolve({ result: [{ code: 'hero', active: true }] })
    },
    DefaultMediaReferenceLookupService: {
        validateInternal: request => Promise.resolve({
            referenceType: request.body.referenceType,
            code: request.body.referenceCode
        })
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
    await validation.validateComponentMedia({ tenant: 'tenant-a', authData: {}, model: {
        code: 'hero-primary-media',
        componentMediaCode: 'hero-primary-media',
        componentCode: 'hero',
        mediaCode: 'hero-image',
        mediaType: 'IMAGE',
        role: 'primary',
        position: 0
    } });
    await assert.rejects(validation.validateComponentMedia({ tenant: 'tenant-a', authData: {}, model: {
        componentMediaCode: 'hero-invalid-media',
        componentCode: 'hero',
        mediaCode: 'hero-image',
        mediaSetCode: 'hero-image-set',
        mediaType: 'IMAGE',
        role: 'primary',
        position: 0
    } }), error => error.code === 'ERR_CMS_00094');

    global._ = require('lodash');
    global.UTILS = {
        isObject: value => value !== null && typeof value === 'object' && !Array.isArray(value)
    };
    global.CONFIG = { get: key => key === 'cms' ? {
        delivery: { defaultLocale: 'en', defaultChannel: 'web', maxDepth: 3, maxComponents: 4 }
    } : undefined };
    const data = {
        routes: [{ site: 'site', path: '/home', locale: 'en', channel: 'web', page: 'home', routeType: 'PAGE', deliveryState: 'ONLINE', accessMode: 'PUBLIC' }],
        pages: [{ code: 'home', name: 'Home', typeCode: 'homePage', template: 'main', internalNote: 'hidden' }],
        details: [{ code: 'homeHero', source: 'home', target: 'hero', slot: 'main', index: 0, active: true }],
        components: [{ code: 'hero', typeCode: 'heroType', accessMode: 'PUBLIC',
            properties: { title: 'Hello' }, secret: 'hidden' }],
        componentMedia: [{ code: 'heroBackground', componentMediaCode: 'heroBackground', componentCode: 'hero',
            mediaSetCode: 'heroBackgroundSet', mediaType: 'IMAGE', role: 'background', slot: 'default',
            position: 0, altText: 'Hero background', storageKey: 'hidden', active: true }],
        templates: [{ code: 'main', renderer: 'template.main', contractVersion: 1 }],
        rendererMappings: [
            { code: 'homePage', renderer: 'page.home', contractVersion: 1, channels: ['web'] },
            { code: 'heroType', renderer: 'component.hero', contractVersion: 2,
                channels: ['web', 'mobile-webview'], deprecated: true, replacementRenderer: 'component.hero-v2' }
        ]
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
        DefaultCmsPageTemplateService: service(data.templates),
        DefaultCmsComponentDetailService: service(data.details),
        DefaultCmsComponentService: service(data.components),
        DefaultCmsComponentMediaService: service(data.componentMedia),
        DefaultCmsTypeCode2RendererService: service(data.rendererMappings)
    };
    const rendererInterceptor = require(path.join(root, 'gContent/cms/src/service/interceptors/defaultItemRendererInterceptorService'));
    await rendererInterceptor.fatchItemRenderer({ tenant: 'tenant-a', authData: {}, options: {} }, data.pages);
    await rendererInterceptor.fatchItemRenderer({ tenant: 'tenant-a', authData: {}, options: {} }, data.components);
    const deliveryPath = path.join(root, 'gContent/cms/src/service/delivery/defaultCmsDeliveryService');
    delete require.cache[require.resolve(deliveryPath)];
    const delivery = require(deliveryPath);
    let response = await delivery.resolvePage({ tenant: 'tenant-a', authData: {}, options: {}, router: { publicAccess: true }, delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } });
    assert.strictEqual(response.result.contractVersion, 1);
    assert.strictEqual(response.result.page.renderer, 'page.home');
    assert.strictEqual(response.result.page.rendererContractVersion, 1);
    assert.deepStrictEqual(response.result.page.rendererChannels, ['web']);
    assert.strictEqual(response.result.page.rendererDeprecated, false);
    assert.deepStrictEqual(response.result.page.templateContract, {
        code: 'main',
        renderer: 'template.main',
        contractVersion: 1
    });
    assert.strictEqual(response.result.page.components[0].code, 'hero');
    assert.strictEqual(response.result.page.components[0].renderer, 'component.hero');
    assert.strictEqual(response.result.page.components[0].rendererContractVersion, 2);
    assert.deepStrictEqual(response.result.page.components[0].rendererChannels, ['web', 'mobile-webview']);
    assert.strictEqual(response.result.page.components[0].rendererDeprecated, true);
    assert.strictEqual(response.result.page.components[0].rendererReplacement, 'component.hero-v2');
    assert.strictEqual(response.result.page.components[0].media[0].mediaSetCode, 'heroBackgroundSet');
    assert.strictEqual(response.result.page.components[0].media[0].role, 'background');
    assert.strictEqual(response.result.page.components[0].media[0].storageKey, undefined);
    assert.strictEqual(response.result.page.internalNote, undefined);
    assert.strictEqual(response.result.page.components[0].secret, undefined);
    data.components[0].accessMode = 'AUTHENTICATED';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', authData: {}, options: {}, router: { publicAccess: true },
        delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } }),
    error => error.code === 'ERR_CMS_00086');
    data.components[0].accessMode = 'PUBLIC';
    data.routes[0].deliveryState = 'DRAFT';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', router: { publicAccess: true }, delivery: { site: 'site', path: '/home', locale: 'en', channel: 'web' } }), error => error.code === 'ERR_CMS_00087');
    data.routes[0].deliveryState = 'ONLINE';
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', delivery: { site: 'site', path: 'https://host' } }), error => error.code === 'ERR_CMS_00085');
    await assert.rejects(delivery.resolvePage({ tenant: 'tenant-a', delivery: { site: 'site', path: '/missing', locale: 'en', channel: 'web' } }), error => error.code === 'ERR_CMS_00087');

    const overridden = Object.assign({}, delivery, {
        normalizeContext: request => ({ site: request.delivery.site, path: '/home', locale: 'en', channel: 'web' })
    });
    let customized = await overridden.resolvePage({ tenant: 'tenant-a', router: { publicAccess: true }, delivery: { site: 'site', path: '/customer-alias' } });
    assert.strictEqual(customized.result.path, '/home', 'later service override must customize effective resolution behavior');

    let invalidationRequests = [];
    global.SERVICE.DefaultCacheService = {
        invalidateResource: request => { invalidationRequests.push(request); return Promise.resolve(true); }
    };
    const invalidation = require(path.join(root, 'gContent/cms/src/service/delivery/defaultCmsDeliveryCacheInvalidationService'));
    await invalidation.invalidate({ tenant: 'tenant-a', authData: { tenant: 'tenant-a' } });
    assert.deepStrictEqual(invalidationRequests.map(item => item.resourceName),
        ['resolvePublicPage', 'resolveAuthenticatedPage']);
    invalidationRequests.forEach(item => {
        assert.strictEqual(item.tenant, 'tenant-a');
        assert.strictEqual(item.cacheType, 'router');
    });
    console.log('CMS content delivery contract validated');
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
