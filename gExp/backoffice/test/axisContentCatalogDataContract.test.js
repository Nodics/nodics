/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is the confidential and proprietary information of Nodics ("Confidential Information").
    You shall not disclose such Confidential Information and shall use it only in accordance with the
    terms of the license agreement you entered into with Nodics.

 */

const assert = require('assert');
const path = require('path');

const moduleRoot = path.resolve(__dirname, '..');
const load = name => require(path.join(moduleRoot, 'data/core/data/axis', name));
const records = data => Object.values(data);

const catalog = records(load('axisContentCatalogData'));
const sites = records(load('axisCmsSiteData'));
const types = records(load('axisCmsTypeCodeData'));
const renderers = records(load('axisCmsRendererData'));
const slots = records(load('axisCmsSlotData'));
const templates = records(load('axisCmsTemplateData'));
const components = records(load('axisCmsComponentData'));
const pages = records(load('axisCmsPageData'));
const routes = records(load('axisCmsRouteData'));
const header = require(path.join(moduleRoot, 'data/core/headers/axis/axisContentCatalogHeader'));

assert.strictEqual(catalog.length, 1);
assert.strictEqual(catalog[0].code, 'axisContentCatalog');
assert.deepStrictEqual(catalog[0].accessGroups, ['employeeUserGroup']);
assert.strictEqual(sites[0].catalog, 'axisContentCatalog');

const typeByCode = new Map(types.map(item => [item.code, item]));
const rendererByCode = new Map(renderers.map(item => [item.code, item]));
types.forEach(type => {
    assert(rendererByCode.has(type.code), 'Missing renderer mapping for ' + type.code);
    assert.strictEqual(rendererByCode.get(type.code).contractVersion, type.contractVersion);
    assert(!rendererByCode.get(type.code).renderer.includes('://'), 'Renderer keys must not be URLs');
});

const slotByCode = new Map(slots.map(item => [item.code, item]));
templates.forEach(template => {
    template.slots.forEach(slotCode => {
        assert(slotByCode.has(slotCode), 'Missing slot ' + slotCode);
        assert.strictEqual(slotByCode.get(slotCode).template, template.code);
    });
});

const componentByCode = new Map(components.map(item => [item.code, item]));
components.forEach(component => {
    assert(typeByCode.has(component.typeCode), 'Missing component type ' + component.typeCode);
    assert(['PUBLIC', 'AUTHENTICATED'].includes(component.accessMode));
    assert(component.properties && typeof component.properties === 'object');
    const serialized = JSON.stringify(component.properties);
    assert(!/<script/i.test(serialized), 'Executable markup is prohibited');
    assert(!serialized.includes('http://') && !serialized.includes('https://'), 'Component properties must not contain endpoint URLs');
});

const pageByCode = new Map(pages.map(item => [item.code, item]));
const templateByCode = new Map(templates.map(item => [item.code, item]));
pages.forEach(page => {
    assert(typeByCode.has(page.typeCode), 'Missing page type ' + page.typeCode);
    assert(templateByCode.has(page.template), 'Missing page template ' + page.template);
    page.cmsComponents.forEach(association => {
        const component = componentByCode.get(association.target);
        const slot = slots.find(item => item.template === page.template && item.name === association.slot);
        assert(component, 'Missing component ' + association.target);
        assert(slot, 'Missing slot ' + association.slot);
        assert(slot.allowedComponentTypes.includes(component.typeCode), 'Component type is not allowed in slot');
    });
});

assert.deepStrictEqual(routes.map(route => route.path), ['/login', '/forgot-password', '/dashboard', '/lock-screen']);
routes.forEach(route => {
    const page = pageByCode.get(route.page);
    assert(page, 'Missing route page ' + route.page);
    assert.strictEqual(route.site, 'axisCmsSite');
    assert.strictEqual(route.deliveryState, 'ONLINE');
    page.cmsComponents.forEach(association => {
        const component = componentByCode.get(association.target);
        if (route.accessMode === 'PUBLIC') {
            assert.strictEqual(component.accessMode, 'PUBLIC', 'Public pages may contain only public components');
        }
    });
});

assert.strictEqual(routes.find(route => route.path === '/login').accessMode, 'PUBLIC');
assert.strictEqual(routes.find(route => route.path === '/forgot-password').accessMode, 'PUBLIC');
assert.strictEqual(routes.find(route => route.path === '/dashboard').accessMode, 'AUTHENTICATED');
assert.strictEqual(routes.find(route => route.path === '/lock-screen').accessMode, 'AUTHENTICATED');
assert(pages.find(page => page.code === 'axisDashboardPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));
assert(pages.find(page => page.code === 'axisLockScreenPage').cmsComponents.every(association =>
    componentByCode.get(association.target).accessMode === 'AUTHENTICATED'));

const enabledHeaders = Object.values(header).flatMap(group => Object.values(group)).filter(item => item.options.enabled);
assert.strictEqual(enabledHeaders.length, 9);
assert(enabledHeaders.every(item => item.options.operation === 'saveAll'));
assert(enabledHeaders.every(item => item.query.code === '$code'));

console.log('Axis content catalog core-data contract tests passed');
