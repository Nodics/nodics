/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */
/**
 * @module cms/test/cmsStorefrontDeliveryContract
 * @description Validates CMS audience introspection, trusted Site isolation, override rejection, modular transport, and fail-closed Storefront delivery.
 * @layer test
 * @owner cms
 */
const assert = require('assert');
const properties = require('../config/properties');
global.CONFIG = { get: name => name === 'cms' ? properties.cms : {} };
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError };
const apparelHandle = 'a'.repeat(43), electronicsHandle = 'e'.repeat(43);
const contexts = {
    [apparelHandle]: { active: true, audience: 'cms', tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', storefrontCode: 'apparel',
        context: { site: 'apparelSite', locale: 'en-AE', channel: 'WEB' } },
    [electronicsHandle]: { active: true, audience: 'cms', tenantCode: 'tenantA', enterpriseCode: 'enterpriseA', storefrontCode: 'electronics',
        context: { site: 'electronicsSite', locale: 'ar-AE', channel: 'MOBILE' } }
};
global.SERVICE = {
    DefaultStorefrontContextAccessService: { introspect: request => Promise.resolve(contexts[request.body.handle]) }
};
const provider = require('../src/service/delivery/defaultCmsStorefrontContextProviderService');
SERVICE.DefaultCmsStorefrontContextProviderService = provider;
const controller = require('../src/controller/defaultCmsDeliveryController');
const route = require('../src/router/routers').cms.cmsDelivery.resolveStorefrontPage;
global.FACADE = { DefaultCmsDeliveryFacade: { resolvePage: request => Promise.resolve({
    site: request.delivery.site, path: request.delivery.path, locale: request.delivery.locale, channel: request.delivery.channel,
    tenant: request.tenant, enterprise: request.authData.enterpriseCode
}) } };

(async () => {
    assert.strictEqual(route.publicAccess, true);
    assert.strictEqual(route.cache.enabled, false);
    assert.strictEqual(route.operation, 'resolveStorefrontPage');
    let apparel = await controller.resolveStorefrontPage({ headers: { 'x-nodics-storefront-context': apparelHandle },
        query: { path: '/home', site: 'electronicsSite', locale: 'xx', channel: 'ATTACK' } });
    assert.deepStrictEqual(apparel, { site: 'apparelSite', path: '/home', locale: 'en-AE', channel: 'WEB', tenant: 'tenantA', enterprise: 'enterpriseA' });
    let electronics = await controller.resolveStorefrontPage({ headers: { 'x-nodics-storefront-context': electronicsHandle }, query: { path: '/home' } });
    assert.strictEqual(electronics.site, 'electronicsSite');
    assert.strictEqual(electronics.locale, 'ar-AE');
    assert.notStrictEqual(apparel.site, electronics.site);

    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.resolve({ active: false });
    await assert.rejects(controller.resolveStorefrontPage({ headers: { 'x-nodics-storefront-context': 'x'.repeat(43) }, query: { path: '/home' } }), error => error.code === 'ERR_CMS_00082');
    await assert.rejects(controller.resolveStorefrontPage({ headers: {}, query: { path: '/home' } }), error => error.code === 'ERR_CMS_00082');
    SERVICE.DefaultStorefrontContextAccessService.introspect = () => Promise.reject(new Error('storefront unavailable'));
    await assert.rejects(controller.resolveStorefrontPage({ headers: { 'x-nodics-storefront-context': 'x'.repeat(43) }, query: { path: '/home' } }), error => error.code === 'ERR_CMS_00082');

    let descriptor;
    properties.cms.storefrontContext.preferLocal = false;
    global.NODICS = { getInternalAuthToken: tenant => tenant === 'default' ? 'service-token' : null };
    SERVICE.DefaultModuleService = {
        buildRequest: value => { descriptor = value; return value; },
        fetch: () => Promise.resolve({ data: { data: contexts[apparelHandle] } })
    };
    let modular = { headers: { 'x-nodics-storefront-context': 'a'.repeat(43) }, delivery: { path: '/modular' } };
    await provider.apply(modular);
    assert.strictEqual(descriptor.apiName, '/context/introspect');
    assert.strictEqual(descriptor.methodName, 'POST');
    assert.deepStrictEqual(descriptor.requestBody, { handle: 'a'.repeat(43), audience: 'cms' });
    assert.strictEqual(descriptor.header.Authorization, 'Bearer service-token');
    assert.strictEqual(descriptor.followRedirects, false);
    assert.strictEqual(modular.delivery.site, 'apparelSite');
    properties.cms.storefrontContext.preferLocal = true;
    console.log('CMS Storefront delivery contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
